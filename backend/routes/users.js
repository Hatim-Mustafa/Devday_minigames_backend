const express = require('express');
const { param, validationResult } = require('express-validator');
const { supabase } = require('../config/db');

const router = express.Router();

const mapUser = (row) => ({
  id: row.id,
  userCode: row.user_code,
  username: row.username,
  metadata: row.metadata,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

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
      const { data: user, error } = await supabase
        .from('users')
        .select('user_code, username')
        .eq('user_code', req.params.userCode)
        .maybeSingle();

      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({ userCode: user.user_code, username: user.username });
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
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }

    return res.json((users || []).map(mapUser));
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
    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('user_code', userCode)
      .maybeSingle();

    if (existingError) {
      console.error(existingError);
      return res.status(500).json({ message: 'Server error' });
    }

    if (existing) {
      return res
        .status(409)
        .json({ message: 'A user with that userCode already exists' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        user_code: userCode,
        username,
        metadata: metadata || {},
      })
      .select('*')
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }

    return res.status(201).json(mapUser(user));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
