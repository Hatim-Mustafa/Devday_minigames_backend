require('dotenv').config({ path: './info.env' });
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

// --------------------------------------------------
// Middleware
// --------------------------------------------------
app.use(cors());
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
app.use('/api/users', require('./routes/users'));
app.use('/api/scores', require('./routes/scores'));
app.use('/api/minigames', require('./routes/minigames'));
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
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Only start when this file is run directly (not during tests)
if (require.main === module) {
  startServer();
}

module.exports = app;
