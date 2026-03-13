require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// --------------------------------------------------
// Middleware
// --------------------------------------------------
app.use(cors());
app.use(express.json());

// --------------------------------------------------
// Routes
// --------------------------------------------------
app.use('/api/users', require('./routes/users'));
app.use('/api/scores', require('./routes/scores'));
app.use('/api/minigames', require('./routes/minigames'));
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
