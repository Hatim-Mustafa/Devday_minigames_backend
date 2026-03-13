const mongoose = require('mongoose');

/**
 * User model.
 * Each participant has a unique userCode (e.g. a QR/badge code) and a username.
 * Additional profile fields can be added once requirements are finalised.
 */
const userSchema = new mongoose.Schema(
  {
    userCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    // Placeholder for any extra participant info (e.g. email, team, etc.)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
