const express = require('express');
const { param, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

/**
 * GET /api/users/username/:userCode
 *
 * Public endpoint used by minigames to look up a participant's username from
 * their unique user code (e.g. a QR / badge code).
 *
 * Returns: { userCode, username }
 */
router.get(
  '/username/:userCode',
  [param('userCode').notEmpty().withMessage('userCode is required').trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findOne({ userCode: req.params.userCode }).select(
        'userCode username'
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({ userCode: user.userCode, username: user.username });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * GET /api/users
 * Admin helper – list all registered users.
 */
router.get('/', async (_req, res) => {
  try {
    const users = await User.find().select('-__v');
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/users
 * Register a new participant.
 * Body: { userCode, username, metadata? }
 */
router.post('/', async (req, res) => {
  const { userCode, username, metadata } = req.body;

  if (!userCode || !username) {
    return res
      .status(400)
      .json({ message: 'userCode and username are required' });
  }

  try {
    const existing = await User.findOne({ userCode });
    if (existing) {
      return res
        .status(409)
        .json({ message: 'A user with that userCode already exists' });
    }

    const user = await User.create({ userCode, username, metadata });
    return res.status(201).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
