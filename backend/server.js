require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const { initializeRedis } = require('./config/redis');

const app = express();
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isLocalOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1'
    );
  } catch (_error) {
    return false;
  }
};

// --------------------------------------------------
// Middleware
// --------------------------------------------------
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server and health checks with no Origin header.
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin) ||
        isLocalOrigin(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(express.json());

// Global rate limiter – 100 requests per minute per IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// Stricter limiter for the admin login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later.' },
});

// --------------------------------------------------
// Routes
// --------------------------------------------------
app.use('/api/scores', require('./routes/scores'));
app.use('/api/minigames', require('./routes/minigames'));
app.use('/api/participants', require('./routes/participants'));
app.use('/api/admin/login', loginLimiter);
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// --------------------------------------------------
// Start
// --------------------------------------------------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await initializeRedis();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Only start when this file is run directly (not during tests)
if (require.main === module) {
  startServer();
}

module.exports = app;
