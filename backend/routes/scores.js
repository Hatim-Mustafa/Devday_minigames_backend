const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/db');

const router = express.Router();

const mapScore = (row) => ({
  id: row.id,
  userCode: row.user_code,
  gameId: row.game_id,
  score: row.score,
  playTime: row.play_time,
  metadata: row.metadata,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * POST /api/scores
 *
 * Public endpoint used by minigames to submit a player's score.
 * Body: { userCode, gameId, score, playTime, metadata? }
 *
 * Returns the saved score document.
 */
router.post(
  '/',
  [
    body('userCode').notEmpty().withMessage('userCode is required').trim(),
    body('gameId').notEmpty().withMessage('gameId is required'),
    body('score').isFloat().withMessage('score must be a number'),
    body('playTime')
      .isFloat({ min: 0 })
      .withMessage('playTime must be a non-negative number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userCode, gameId, score, playTime, metadata } = req.body;
    const parsedScore = Number(score);
    const parsedPlayTime = Number(playTime);

    try {
      // Verify the user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('user_code', userCode)
        .maybeSingle();

      if (userError) {
        console.error(userError);
        return res.status(500).json({ message: 'Server error' });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify the game is registered and active
      const { data: game, error: gameError } = await supabase
        .from('minigames')
        .select('id, is_active')
        .eq('id', gameId)
        .maybeSingle();

      if (gameError) {
        console.error(gameError);
        return res.status(500).json({ message: 'Server error' });
      }

      if (!game) {
        return res.status(404).json({ message: 'Minigame not found' });
      }
      if (!game.is_active) {
        return res.status(403).json({ message: 'Minigame is not active' });
      }

      // Upsert: one row per (userCode, gameId) – always overwrite with latest submission
      const { data: savedScore, error } = await supabase
        .from('scores')
        .upsert(
          {
            user_code: userCode,
            game_id: gameId,
            score: parsedScore,
            play_time: parsedPlayTime,
            metadata: metadata || {},
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_code,game_id' }
        )
        .select('*')
        .single();

      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
      }

      return res.status(200).json(mapScore(savedScore));
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
 * Sorted by score descending; ties broken by shortest playTime.
 *
 * Optional query param: ?limit=N  (omit for full list)
 */
router.get('/leaderboard/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const limitParam = parseInt(req.query.limit, 10);
    const hasLimit = !isNaN(limitParam) && limitParam > 0;

    const { data: game, error: gameError } = await supabase
      .from('minigames')
      .select('id, name, is_active')
      .eq('id', gameId)
      .maybeSingle();

    if (gameError) {
      console.error(gameError);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!game) {
      return res.status(404).json({ message: 'Minigame not found' });
    }

    // One row per user per game – simple select + sort
    let query = supabase
      .from('scores')
      .select('user_code, score, play_time, updated_at')
      .eq('game_id', gameId)
      .order('score', { ascending: false })
      .order('play_time', { ascending: true })
      .order('updated_at', { ascending: true });

    if (hasLimit) {
      query = query.limit(limitParam);
    }

    const { data: board, error } = await query;

    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }

    const ranked = (board || []).map((entry, i) => ({
      rank: i + 1,
      userCode: entry.user_code,
      score: entry.score,
      playTime: entry.play_time,
      updatedAt: entry.updated_at,
    }));

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
    let query = supabase
      .from('scores')
      .select(
        'id, user_code, game_id, score, play_time, metadata, created_at, updated_at, minigames(name)'
      )
      .order('updated_at', { ascending: false });

    if (req.query.userCode) {
      query = query.eq('user_code', req.query.userCode);
    }
    if (req.query.gameId) {
      query = query.eq('game_id', req.query.gameId);
    }

    const { data: scores, error } = await query;

    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }

    const response = (scores || []).map((row) => ({
      ...mapScore(row),
      game: row.minigames ? { name: row.minigames.name } : null,
    }));

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
