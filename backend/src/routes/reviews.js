const express = require('express');
const { authenticate } = require('../middleware/auth');
const { PullRequest, Review } = require('../models');
const { explainCode } = require('../services/geminiService');

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/reviews/:pullRequestId
 * Get the AI review for a specific PR
 */
router.get('/:pullRequestId', async (req, res, next) => {
  try {
    const pr = await PullRequest.findByPk(req.params.pullRequestId);
    if (!pr) return res.status(404).json({ success: false, error: 'Pull request not found' });

    const review = await Review.findOne({ where: { pullRequestId: req.params.pullRequestId } });
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found. Trigger analysis first via POST /api/prs/analyze',
        analysisStatus: pr.analysisStatus,
      });
    }

    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reviews/status/:pullRequestId
 * Lightweight polling endpoint to check analysis status
 */
router.get('/status/:pullRequestId', async (req, res, next) => {
  try {
    const pr = await PullRequest.findByPk(req.params.pullRequestId, {
      attributes: ['id', 'analysisStatus', 'title', 'repoFullName'],
    });
    if (!pr) return res.status(404).json({ success: false, error: 'PR not found' });
    res.json({ success: true, data: { analysisStatus: pr.analysisStatus, prId: pr.id } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/reviews/explain
 * Explain a code snippet using Gemini
 * Body: { code, language }
 */
router.post('/explain', async (req, res, next) => {
  try {
    const { code, language = '' } = req.body;
    if (!code) return res.status(400).json({ success: false, error: 'code is required' });

    const explanation = await explainCode(code, language);
    res.json({ success: true, data: { explanation } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
