require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { redis } = require('./config/redis');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database (also enables pgvector + syncs models)
    await connectDB();

    // Verify Redis
    await redis.ping();
    console.log('✅ Redis ping successful');

    const server = app.listen(PORT, () => {
      console.log(`\n🚀 CodeLens API running on http://localhost:${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Frontend: ${process.env.FRONTEND_URL}`);
      console.log(`\n📋 API Endpoints:`);
      console.log(`   GET  /api/health`);
      console.log(`   GET  /api/auth/github         → OAuth start`);
      console.log(`   GET  /api/auth/github/callback → OAuth callback`);
      console.log(`   GET  /api/auth/me              → Current user`);
      console.log(`   GET  /api/prs                  → List PRs`);
      console.log(`   POST /api/prs/analyze          → Trigger analysis`);
      console.log(`   GET  /api/reviews/:id          → Get AI review`);
      console.log(`   POST /api/search               → Semantic search`);
      console.log(`   POST /api/search/index         → Index repo`);
      console.log(`   POST /api/webhooks/github      → GitHub webhook`);
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('\n🛑 Shutting down gracefully...');
      server.close(async () => {
        await redis.quit();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
