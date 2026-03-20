const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/db');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

const mapMinigame = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  isActive: row.is_active,
  metadata: row.metadata,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * GET /api/minigames
 * List all registered minigames.  Publicly accessible so active games can
 * be discovered by the admin panel or other tooling.
 */
router.get('/', async (_req, res) => {
  try {
    const { data: games, error } = await supabase
      .from('minigames')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }

    return res.json((games || []).map(mapMinigame));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/minigames/:id
 * Get a single minigame by its id.
 */
router.get('/:id', async (req, res) => {
  try {
    const { data: game, error } = await supabase
      .from('minigames')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!game) {
      return res.status(404).json({ message: 'Minigame not found' });
    }
    return res.json(mapMinigame(game));
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
      const { data: existing, error: existingError } = await supabase
        .from('minigames')
        .select('id')
        .eq('name', name)
        .maybeSingle();

      if (existingError) {
        console.error(existingError);
        return res.status(500).json({ message: 'Server error' });
      }

      if (existing) {
        return res
          .status(409)
          .json({ message: 'A minigame with that name already exists' });
      }

      const { data: game, error } = await supabase
        .from('minigames')
        .insert({
          name,
          description: description || '',
          is_active: typeof isActive === 'boolean' ? isActive : true,
          metadata: metadata || {},
        })
        .select('*')
        .single();

      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
      }

      return res.status(201).json(mapMinigame(game));
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
    const updatePayload = {};
    if (Object.prototype.hasOwnProperty.call(req.body, 'name')) {
      updatePayload.name = req.body.name;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {
      updatePayload.description = req.body.description;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'isActive')) {
      updatePayload.is_active = req.body.isActive;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'metadata')) {
      updatePayload.metadata = req.body.metadata;
    }

    const { data: game, error } = await supabase
      .from('minigames')
      .update(updatePayload)
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!game) {
      return res.status(404).json({ message: 'Minigame not found' });
    }
    return res.json(mapMinigame(game));
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
    const { data: game, error } = await supabase
      .from('minigames')
      .delete()
      .eq('id', req.params.id)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }

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
