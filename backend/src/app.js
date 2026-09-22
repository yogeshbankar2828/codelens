require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const prRoutes = require('./routes/prs');
const reviewRoutes = require('./routes/reviews');
const searchRoutes = require('./routes/search');
const webhookRoutes = require('./routes/webhooks');
const { errorHandler } = require('./middleware/errorHandler');
const { getQueueStats } = require('./services/queueService');

const app = express();

// ─── Security & Middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parsers (note: webhook route uses raw body, handled in its own router)
app.use('/api/webhooks', webhookRoutes); // Must be before JSON parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Passport init (no sessions — using JWT)
app.use(passport.initialize());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/prs', prRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  let queues = { status: 'offline' };
  try {
    queues = await getQueueStats();
  } catch (err) {
    queues = { status: 'unavailable', error: err.message };
  }

  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    queues,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
