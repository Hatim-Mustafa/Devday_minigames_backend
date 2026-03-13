const express = require('express');
const { body, validationResult } = require('express-validator');
const Score = require('../models/Score');
const User = require('../models/User');
const Minigame = require('../models/Minigame');

const router = express.Router();

/**
 * POST /api/scores
 *
 * Public endpoint used by minigames to submit a player's score.
 * Body: { userCode, gameId, score, metadata? }
 *
 * Returns the saved score document.
 */
router.post(
  '/',
  [
    body('userCode').notEmpty().withMessage('userCode is required').trim(),
    body('gameId').notEmpty().withMessage('gameId is required'),
    body('score').isNumeric().withMessage('score must be a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userCode, gameId, score, metadata } = req.body;

    try {
      // Verify the user exists
      const user = await User.findOne({ userCode });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify the game is registered and active
      const game = await Minigame.findById(gameId);
      if (!game) {
        return res.status(404).json({ message: 'Minigame not found' });
      }
      if (!game.isActive) {
        return res.status(403).json({ message: 'Minigame is not active' });
      }

      const newScore = await Score.create({
        userCode,
        gameId,
        score,
        metadata,
      });

      return res.status(201).json(newScore);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * GET /api/scores
 * Admin helper – list all score submissions.
 * Optional query params: ?userCode=…  ?gameId=…
 */
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.userCode) filter.userCode = req.query.userCode;
    if (req.query.gameId) filter.gameId = req.query.gameId;

    const scores = await Score.find(filter)
      .populate('gameId', 'name')
      .select('-__v')
      .sort({ createdAt: -1 });

    return res.json(scores);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
