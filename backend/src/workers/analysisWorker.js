require('dotenv').config();
const { connectDB } = require('../config/db');
const { analysisQueue, indexingQueue } = require('../services/queueService');
const { PullRequest, Review, CodeEmbedding } = require('../models');
const GitHubService = require('../services/githubService');
const { analyzePullRequest, generateEmbedding } = require('../services/geminiService');
const { sequelize } = require('../config/db');

// ─────────────────────────────────────────────
// PR Analysis Processor
// ─────────────────────────────────────────────

analysisQueue.process('analyze-pr', 2, async (job) => {
  const { pullRequestId, repoFullName, prNumber, accessToken } = job.data;

  console.log(`🔍 Processing PR analysis: ${repoFullName}#${prNumber}`);
  await job.progress(10);

  // Mark as processing
  await PullRequest.update(
    { analysisStatus: 'processing' },
    { where: { id: pullRequestId } }
  );

  try {
    const [owner, repo] = repoFullName.split('/');
    const github = new GitHubService(accessToken);

    // Step 1: Fetch diff
    await job.progress(20);
    const diff = await github.getPullRequestDiff(owner, repo, prNumber);
    const prData = await github.getPullRequest(owner, repo, prNumber);

    // Step 2: Run AI analysis
    await job.progress(40);
    const analysis = await analyzePullRequest(diff, prData.title, prData.body || '');

    // Step 3: Save review to DB
    await job.progress(80);
    await Review.create({
      pullRequestId,
      summary: analysis.summary,
      bugs: analysis.bugs || [],
      securityIssues: analysis.securityIssues || [],
      codeQuality: analysis.codeQuality || [],
      complexity: analysis.complexity || {},
      overallScore: analysis.overallScore || 0,
      bugScore: analysis.bugScore || 0,
      securityScore: analysis.securityScore || 0,
      qualityScore: analysis.qualityScore || 0,
      diffSnapshot: diff.slice(0, 50000),
    });

    // Step 4: Update PR status
    await PullRequest.update(
      { analysisStatus: 'completed' },
      { where: { id: pullRequestId } }
    );

    await job.progress(100);
    console.log(`✅ Analysis complete for ${repoFullName}#${prNumber} — Score: ${analysis.overallScore}`);
    return { success: true, score: analysis.overallScore };
  } catch (error) {
    console.error(`❌ Analysis failed for ${repoFullName}#${prNumber}:`, error.message);
    await PullRequest.update(
      { analysisStatus: 'failed' },
      { where: { id: pullRequestId } }
    );
    throw error;
  }
});

// ─────────────────────────────────────────────
// Repo Indexing Processor (for vector search)
// ─────────────────────────────────────────────

const SUPPORTED_EXTENSIONS = [
  '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go',
  '.rs', '.cpp', '.c', '.cs', '.php', '.rb', '.swift',
  '.kt', '.md', '.json', '.yaml', '.yml', '.env.example',
];

indexingQueue.process('index-repo', 1, async (job) => {
  const { repoFullName, accessToken } = job.data;
  const [owner, repo] = repoFullName.split('/');

  console.log(`📚 Indexing repository: ${repoFullName}`);
  await job.progress(5);

  const github = new GitHubService(accessToken);

  // Get all files in the repo
  const tree = await github.getRepoTree(owner, repo);
  const codeFiles = tree.filter(
    (f) => f.type === 'blob' && SUPPORTED_EXTENSIONS.some((ext) => f.path.endsWith(ext))
  ).slice(0, 200); // cap at 200 files

  console.log(`📁 Found ${codeFiles.length} indexable files in ${repoFullName}`);

  // Delete old embeddings for this repo
  await CodeEmbedding.destroy({ where: { repoFullName } });

  let processed = 0;
  for (const file of codeFiles) {
    try {
      const content = await github.getFileContent(owner, repo, file.path);
      if (!content || content.length < 50) continue;

      // Chunk content if large (2000 char chunks with 200 char overlap)
      const chunks = chunkText(content, 2000, 200);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await generateEmbedding(chunk);

        await CodeEmbedding.create({
          repoFullName,
          filePath: file.path,
          content: chunk,
          embedding: JSON.stringify(embedding),
          language: getLanguage(file.path),
          sha: file.sha,
          chunkIndex: i,
        });
      }

      processed++;
      await job.progress(Math.floor((processed / codeFiles.length) * 100));
    } catch (err) {
      console.warn(`⚠️  Skipped ${file.path}: ${err.message}`);
    }
  }

  console.log(`✅ Indexed ${processed}/${codeFiles.length} files for ${repoFullName}`);
  return { indexed: processed, total: codeFiles.length };
});

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function chunkText(text, chunkSize, overlap) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize));
    start += chunkSize - overlap;
  }
  return chunks;
}

function getLanguage(filePath) {
  const ext = filePath.split('.').pop();
  const map = {
    js: 'javascript', ts: 'typescript', jsx: 'javascript', tsx: 'typescript',
    py: 'python', java: 'java', go: 'go', rs: 'rust', cpp: 'cpp',
    c: 'c', cs: 'csharp', php: 'php', rb: 'ruby', swift: 'swift',
    kt: 'kotlin', md: 'markdown',
  };
  return map[ext] || ext;
}

// Start worker
connectDB().then(() => {
  console.log('🚀 Analysis worker started and listening for jobs...');
});
