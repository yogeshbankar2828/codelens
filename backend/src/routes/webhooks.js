const express = require('express');
const crypto = require('crypto');
const { PullRequest } = require('../models');
const { queuePRAnalysis } = require('../services/queueService');
const { User } = require('../models');

const router = express.Router();

/**
 * Verify GitHub webhook HMAC-SHA256 signature
 */
const verifyWebhookSignature = (req, res, buf) => {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) throw new Error('Missing X-Hub-Signature-256 header');

  const expected = `sha256=${crypto
    .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
    .update(buf)
    .digest('hex')}`;

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error('Webhook signature mismatch');
  }
};

/**
 * POST /api/webhooks/github
 * Receives GitHub webhook events (pull_request events)
 */
router.post(
  '/github',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    // Verify signature
    try {
      verifyWebhookSignature(req, res, req.body);
    } catch (err) {
      console.warn('⚠️  Webhook signature verification failed:', err.message);
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const event = req.headers['x-github-event'];
    const payload = JSON.parse(req.body.toString());

    console.log(`📨 GitHub webhook: event=${event}, action=${payload.action}`);

    // Only process pull_request events that open or synchronize a PR
    if (event !== 'pull_request') {
      return res.status(200).json({ message: `Event '${event}' ignored` });
    }

    if (!['opened', 'synchronize', 'reopened'].includes(payload.action)) {
      return res.status(200).json({ message: `Action '${payload.action}' ignored` });
    }

    const pr = payload.pull_request;
    const repoFullName = payload.repository.full_name;
    const [owner] = repoFullName.split('/');

    try {
      // Find a user with access to this repo (the one who installed the webhook)
      const user = await User.findOne({
        where: {
          username: owner,
        },
      });

      const accessToken = user?.githubAccessToken || process.env.GITHUB_SERVICE_TOKEN;
      if (!accessToken) {
        console.warn(`⚠️  No access token found for ${owner}`);
        return res.status(200).json({ message: 'No access token — analysis skipped' });
      }

      // Upsert PR record
      const [localPR] = await PullRequest.upsert({
        githubPrId: pr.number,
        repoFullName,
        title: pr.title,
        description: pr.body || '',
        author: pr.user.login,
        authorAvatar: pr.user.avatar_url,
        status: pr.state,
        analysisStatus: 'pending',
        headSha: pr.head.sha,
        baseBranch: pr.base.ref,
        headBranch: pr.head.ref,
        additions: pr.additions || 0,
        deletions: pr.deletions || 0,
        changedFiles: pr.changed_files || 0,
        githubUrl: pr.html_url,
      });

      // Queue async analysis
      const job = await queuePRAnalysis({
        pullRequestId: localPR.id,
        repoFullName,
        prNumber: pr.number,
        accessToken,
      });

      console.log(`✅ Queued webhook-triggered analysis job ${job.id} for ${repoFullName}#${pr.number}`);
      res.status(200).json({ message: 'Analysis queued', jobId: job.id });
    } catch (error) {
      console.error('❌ Webhook processing error:', error.message);
      // Always return 200 to GitHub to prevent retries for our internal errors
      res.status(200).json({ message: 'Webhook received (processing error logged)' });
    }
  }
);

/**
 * GET /api/webhooks/health
 * Ping to confirm webhook endpoint is reachable
 */
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Webhook endpoint healthy' });
});

module.exports = router;
