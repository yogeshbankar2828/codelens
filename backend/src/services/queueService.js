const Bull = require('bull');
const { redisConfig } = require('../config/redis');

// PR analysis queue — processes GitHub PR diffs through Gemini AI
const analysisQueue = new Bull('pr-analysis', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,  // keep last 100 completed jobs
    removeOnFail: 50,
  },
});

// Repository indexing queue — embeds repo files for vector search
const indexingQueue = new Bull('repo-indexing', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 10000 },
    removeOnComplete: 50,
  },
});

analysisQueue.on('completed', (job) => {
  console.log(`✅ Analysis job ${job.id} completed for PR #${job.data.prNumber}`);
});

analysisQueue.on('failed', (job, err) => {
  console.error(`❌ Analysis job ${job.id} failed:`, err.message);
});

indexingQueue.on('completed', (job) => {
  console.log(`✅ Indexing job ${job.id} completed for repo ${job.data.repoFullName}`);
});

indexingQueue.on('failed', (job, err) => {
  console.error(`❌ Indexing job ${job.id} failed:`, err.message);
});

/**
 * Add a PR analysis job to the queue
 */
const queuePRAnalysis = async (data) => {
  const job = await analysisQueue.add('analyze-pr', data, {
    priority: data.priority || 1,
  });
  console.log(`📋 Queued PR analysis job ${job.id} for ${data.repoFullName}#${data.prNumber}`);
  return job;
};

/**
 * Add a repo indexing job to the queue
 */
const queueRepoIndexing = async (data) => {
  const job = await indexingQueue.add('index-repo', data);
  console.log(`📋 Queued repo indexing job ${job.id} for ${data.repoFullName}`);
  return job;
};

/**
 * Get queue stats
 */
const getQueueStats = async () => {
  const [aWaiting, aActive, aCompleted, aFailed, iWaiting, iActive] = await Promise.all([
    analysisQueue.getWaitingCount(),
    analysisQueue.getActiveCount(),
    analysisQueue.getCompletedCount(),
    analysisQueue.getFailedCount(),
    indexingQueue.getWaitingCount(),
    indexingQueue.getActiveCount(),
  ]);
  return {
    analysis: { waiting: aWaiting, active: aActive, completed: aCompleted, failed: aFailed },
    indexing: { waiting: iWaiting, active: iActive },
  };
};

module.exports = {
  analysisQueue,
  indexingQueue,
  queuePRAnalysis,
  queueRepoIndexing,
  getQueueStats,
};
