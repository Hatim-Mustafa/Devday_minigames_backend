const express = require('express');
const { body, validationResult } = require('express-validator');
const Minigame = require('../models/Minigame');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/minigames
 * List all registered minigames.  Publicly accessible so active games can
 * be discovered by the admin panel or other tooling.
 */
router.get('/', async (_req, res) => {
  try {
    const games = await Minigame.find().select('-__v').sort({ createdAt: -1 });
    return res.json(games);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/minigames/:id
 * Get a single minigame by its MongoDB id.
 */
router.get('/:id', async (req, res) => {
  try {
    const game = await Minigame.findById(req.params.id).select('-__v');
    if (!game) {
      return res.status(404).json({ message: 'Minigame not found' });
    }
    return res.json(game);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/minigames  [Admin only]
 * Register a new minigame.
 * Body: { name, description?, isActive?, metadata? }
 */
router.post(
  '/',
  adminAuth,
  [body('name').notEmpty().withMessage('name is required').trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, isActive, metadata } = req.body;

    try {
      const existing = await Minigame.findOne({ name });
      if (existing) {
        return res
          .status(409)
          .json({ message: 'A minigame with that name already exists' });
      }

      const game = await Minigame.create({
        name,
        description,
        isActive,
        metadata,
      });
      return res.status(201).json(game);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * PUT /api/minigames/:id  [Admin only]
 * Update an existing minigame registration.
 */
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const game = await Minigame.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-__v');

    if (!game) {
      return res.status(404).json({ message: 'Minigame not found' });
    }
    return res.json(game);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/minigames/:id  [Admin only]
 * Remove a minigame registration.
 */
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const game = await Minigame.findByIdAndDelete(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Minigame not found' });
    }
    return res.json({ message: 'Minigame removed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
