const express = require('express');
const { authenticate } = require('../middleware/auth');
const { CodeEmbedding } = require('../models');
const { generateEmbedding, generateSearchAnswer } = require('../services/geminiService');
const { queueRepoIndexing } = require('../services/queueService');
const { sequelize } = require('../config/db');

const router = express.Router();

router.use(authenticate);

/**
 * POST /api/search
 * Repository-aware semantic code search
 * Body: { query, repoFullName, topK? }
 *
 * Flow:
 *  1. Embed query with text-embedding-004
 *  2. Cosine similarity search against pgvector
 *  3. Feed top-K chunks into Gemini for grounded answer
 */
router.post('/', async (req, res, next) => {
  try {
    const { query, repoFullName, topK = 5 } = req.body;
    if (!query || !repoFullName) {
      return res.status(400).json({ success: false, error: 'query and repoFullName are required' });
    }

    // Step 1: Embed the query
    const queryEmbedding = await generateEmbedding(query);
    const embeddingJson = JSON.stringify(queryEmbedding);

    // Step 2: Vector similarity search using pgvector
    // We store embeddings as JSON text and cast to vector type
    const results = await sequelize.query(
      `
      SELECT
        id,
        "filePath",
        content,
        language,
        "chunkIndex",
        (embedding::vector <=> :queryVec::vector) AS distance
      FROM code_embeddings
      WHERE "repoFullName" = :repo
        AND embedding IS NOT NULL
      ORDER BY embedding::vector <=> :queryVec::vector
      LIMIT :limit
      `,
      {
        replacements: {
          queryVec: embeddingJson,
          repo: repoFullName,
          limit: topK,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (results.length === 0) {
      return res.json({
        success: true,
        data: {
          answer: 'No indexed files found for this repository. Please index the repo first via POST /api/search/index.',
          sources: [],
        },
      });
    }

    // Step 3: Generate grounded answer with Gemini
    const answer = await generateSearchAnswer(query, results);

    res.json({
      success: true,
      data: {
        answer,
        sources: results.map((r) => ({
          filePath: r.filePath,
          language: r.language,
          snippet: r.content.slice(0, 300) + (r.content.length > 300 ? '...' : ''),
          distance: parseFloat(r.distance).toFixed(4),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/search/index
 * Trigger repository indexing (embedding all files)
 * Body: { repoFullName }
 */
router.post('/index', async (req, res, next) => {
  try {
    const { repoFullName } = req.body;
    if (!repoFullName) {
      return res.status(400).json({ success: false, error: 'repoFullName is required' });
    }

    const job = await queueRepoIndexing({
      repoFullName,
      accessToken: req.user.githubAccessToken,
    });

    res.json({
      success: true,
      message: 'Repository indexing queued',
      data: { jobId: job.id, repoFullName },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/search/index/status/:repoFullName
 * Check how many files are indexed for a repo
 */
router.get('/index/status/:owner/:repo', async (req, res, next) => {
  try {
    const repoFullName = `${req.params.owner}/${req.params.repo}`;
    const count = await CodeEmbedding.count({ where: { repoFullName } });
    const files = await CodeEmbedding.count({
      where: { repoFullName },
      distinct: true,
      col: 'filePath',
    });
    res.json({ success: true, data: { repoFullName, chunks: count, files } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
