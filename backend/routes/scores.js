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
    body('playTime').isNumeric({ min: 0 }).withMessage('playTime must be a non-negative number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userCode, gameId, score, playTime, metadata } = req.body;

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

      // Upsert: one row per (userCode, gameId) – always overwrite with latest submission
      const savedScore = await Score.findOneAndUpdate(
        { userCode, gameId },
        { $set: { score, playTime, metadata } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return res.status(200).json(savedScore);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * GET /api/scores/leaderboard/:gameId
 *
 * Returns the ordered scoreboard for a specific minigame.
 * Each user appears once with their personal best score.
 * Sorted by score descending; ties broken by earliest submission.
 *
 * Optional query param: ?limit=N  (omit for full list)
 */
router.get('/leaderboard/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const limitParam = parseInt(req.query.limit, 10);
    const hasLimit = !isNaN(limitParam) && limitParam > 0;

    const game = await Minigame.findById(gameId).select('name isActive');
    if (!game) {
      return res.status(404).json({ message: 'Minigame not found' });
    }

    // One row per user per game – simple find + sort (no grouping needed)
    const mongoose = require('mongoose');
    let query = Score.find(
      { gameId: new mongoose.Types.ObjectId(gameId) },
      { _id: 0, userCode: 1, score: 1, playTime: 1, updatedAt: 1 }
    ).sort({ score: -1, playTime: 1 });

    if (hasLimit) query = query.limit(limitParam);

    const board = await query.lean();

    const ranked = board.map((entry, i) => ({ rank: i + 1, ...entry }));

    return res.json({ gameId, gameName: game.name, leaderboard: ranked });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

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
