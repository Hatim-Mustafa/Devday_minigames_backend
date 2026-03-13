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
    // Placeholder for any extra per-game data (e.g. level reached, time taken)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Score', scoreSchema);
