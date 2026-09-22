const express = require('express');
const { authenticate } = require('../middleware/auth');
const { PullRequest, Review } = require('../models');
const GitHubService = require('../services/githubService');
const { queuePRAnalysis } = require('../services/queueService');

const router = express.Router();

// All PR routes require authentication
router.use(authenticate);

/**
 * GET /api/prs
 * List PRs from a connected GitHub repo (live from GitHub API)
 * Query: ?owner=octocat&repo=hello-world&state=open&page=1
 */
router.get('/', async (req, res, next) => {
  try {
    const { owner, repo, state = 'open', page = 1 } = req.query;
    if (!owner || !repo) {
      return res.status(400).json({ success: false, error: 'owner and repo are required query params' });
    }

    const github = new GitHubService(req.user.githubAccessToken);
    const prs = await github.getPullRequests(owner, repo, state, parseInt(page));

    // Enrich with local analysis status
    const enriched = await Promise.all(
      prs.map(async (pr) => {
        const local = await PullRequest.findOne({
          where: { githubPrId: pr.number, repoFullName: `${owner}/${repo}` },
          attributes: ['id', 'analysisStatus'],
        });
        return {
          id: local?.id || null,
          githubPrId: pr.number,
          title: pr.title,
          author: pr.user.login,
          authorAvatar: pr.user.avatar_url,
          status: pr.state,
          analysisStatus: local?.analysisStatus || 'not_analyzed',
          headBranch: pr.head.ref,
          baseBranch: pr.base.ref,
          additions: pr.additions || 0,
          deletions: pr.deletions || 0,
          changedFiles: pr.changed_files || 0,
          githubUrl: pr.html_url,
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
        };
      })
    );

    res.json({ success: true, data: enriched, page: parseInt(page) });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/prs/:id
 * Get a single stored PR with its review
 */
router.get('/:id', async (req, res, next) => {
  try {
    const pr = await PullRequest.findByPk(req.params.id, {
      include: [{ model: Review, as: 'review' }],
    });
    if (!pr) return res.status(404).json({ success: false, error: 'PR not found' });
    res.json({ success: true, data: pr });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/prs/analyze
 * Trigger AI analysis for a PR (stores it locally + queues job)
 * Body: { owner, repo, prNumber }
 */
router.post('/analyze', async (req, res, next) => {
  try {
    const { owner, repo, prNumber } = req.body;
    if (!owner || !repo || !prNumber) {
      return res.status(400).json({ success: false, error: 'owner, repo, and prNumber are required' });
    }

    const repoFullName = `${owner}/${repo}`;
    const github = new GitHubService(req.user.githubAccessToken);
    const ghPR = await github.getPullRequest(owner, repo, parseInt(prNumber));

    // Upsert PR in our DB
    const [pr] = await PullRequest.upsert({
      githubPrId: ghPR.number,
      repoFullName,
      title: ghPR.title,
      description: ghPR.body || '',
      author: ghPR.user.login,
      authorAvatar: ghPR.user.avatar_url,
      status: ghPR.state,
      analysisStatus: 'pending',
      headSha: ghPR.head.sha,
      baseBranch: ghPR.base.ref,
      headBranch: ghPR.head.ref,
      additions: ghPR.additions || 0,
      deletions: ghPR.deletions || 0,
      changedFiles: ghPR.changed_files || 0,
      githubUrl: ghPR.html_url,
    });

    // Queue async analysis
    const job = await queuePRAnalysis({
      pullRequestId: pr.id,
      repoFullName,
      prNumber: ghPR.number,
      accessToken: req.user.githubAccessToken,
    });

    res.json({
      success: true,
      message: 'PR analysis queued',
      data: { pullRequestId: pr.id, jobId: job.id },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/prs/repos/list
 * List all GitHub repos for the authenticated user
 */
router.get('/repos/list', async (req, res, next) => {
  try {
    const github = new GitHubService(req.user.githubAccessToken);
    const repos = await github.getUserRepos();
    const simplified = repos.map((r) => ({
      fullName: r.full_name,
      name: r.name,
      owner: r.owner.login,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      isPrivate: r.private,
      updatedAt: r.updated_at,
    }));
    res.json({ success: true, data: simplified });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
