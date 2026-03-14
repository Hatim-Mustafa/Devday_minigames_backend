const mongoose = require('mongoose');

/**
 * Score model.
 * Records a single score submission from a minigame.
 * The minigame identifies itself via its gameId (from the Minigame collection).
 * Additional score metadata (e.g. level, time, custom fields) can be stored in
 * the `metadata` object once per-game requirements are finalised.
 */
const scoreSchema = new mongoose.Schema(
  {
    userCode: {
      type: String,
      required: true,
      trim: true,
      ref: 'User',
    },
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Minigame',
    },
    score: {
      type: Number,
      required: true,
    },
    // Play duration in seconds submitted alongside the score
    playTime: {
      type: Number,
      required: true,
      min: 0,
    },
    // Placeholder for any extra per-game data (e.g. level reached, time taken)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Leaderboard sort: best score first, then shortest play time for ties
scoreSchema.index({ gameId: 1, score: -1, playTime: 1 });
// One entry per user per game – enforced at DB level
scoreSchema.index({ userCode: 1, gameId: 1 }, { unique: true });

module.exports = mongoose.model('Score', scoreSchema);
