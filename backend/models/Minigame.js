const mongoose = require('mongoose');

/**
 * Minigame model.
 * Registered via the admin panel.  The exact fields required per game are
 * not yet finalised – `metadata` acts as a flexible catch-all for any
 * game-specific details that need to be stored at registration time.
 */
const minigameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Flexible storage for any additional registration details
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Minigame', minigameSchema);
