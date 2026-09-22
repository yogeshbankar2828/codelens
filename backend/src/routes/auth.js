const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { User } = require('../models');
const { generateToken } = require('../middleware/auth');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ─── Passport GitHub Strategy ─────────────────────────────────────────────────

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email', 'repo', 'read:org'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ where: { githubId: profile.id } });

        if (user) {
          // Update token on re-login
          await user.update({
            githubAccessToken: accessToken,
            avatarUrl: profile.photos?.[0]?.value,
            email: profile.emails?.[0]?.value || user.email,
          });
        } else {
          user = await User.create({
            githubId: profile.id,
            username: profile.username,
            email: profile.emails?.[0]?.value || null,
            avatarUrl: profile.photos?.[0]?.value || null,
            githubAccessToken: accessToken,
            role: 'developer',
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (e) {
    done(e, null);
  }
});

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/auth/github
 * Redirect to GitHub OAuth consent screen
 */
router.get('/github', passport.authenticate('github', { session: false }));

/**
 * GET /api/auth/github/callback
 * GitHub calls back here after user approves
 */
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
  (req, res) => {
    const token = generateToken(req.user);
    // Redirect to frontend with token in query (frontend stores in localStorage)
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

/**
 * GET /api/auth/me
 * Returns the currently authenticated user
 */
router.get('/me', authenticate, (req, res) => {
  const { id, username, email, avatarUrl, role, connectedRepos, createdAt } = req.user;
  res.json({
    success: true,
    user: { id, username, email, avatarUrl, role, connectedRepos, createdAt },
  });
});

/**
 * POST /api/auth/logout
 * Client-side token discard; optionally blacklist here
 */
router.post('/logout', authenticate, (req, res) => {
  res.json({ success: true, message: 'Logged out. Delete your token on the client.' });
});

module.exports = router;
