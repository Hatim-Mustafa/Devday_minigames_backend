const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/db');
const { minigameApiKeyAuth } = require('../middleware/auth');
const {
  getCachedJson,
  setCachedJson,
  deleteCacheByPrefix,
} = require('../config/redis');

const router = express.Router();
const LEADERBOARD_CACHE_TTL_SECONDS =
  parseInt(process.env.REDIS_LEADERBOARD_TTL_SECONDS, 10) || 15;
const SCORES_LIST_CACHE_TTL_SECONDS =
  parseInt(process.env.REDIS_SCORES_LIST_TTL_SECONDS, 10) || 15;

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
  minigameApiKeyAuth({ requireGameIdFromBody: true }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userCode, gameId, score, playTime, metadata } = req.body;
    const parsedScore = Number(score);
    const parsedPlayTime = Number(playTime);

    try {
      // Verify the minigame player exists
      const { data: player, error: playerError } = await supabase
        .from('Participant')
        .select('id')
        .eq('minigameCode', userCode)
        .maybeSingle();

      if (playerError) {
        console.error(playerError);
        return res.status(500).json({ message: 'Server error' });
      }

      if (!player) {
        return res.status(404).json({ message: 'Minigame player not found' });
      }

      // Verify the game is registered and active
      const { data: game, error: gameError } = await supabase
        .from('Minigame')
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

      const { data: existingScore, error: existingScoreError } = await supabase
        .from('Score')
        .select('id')
        .eq('user_code', userCode)
        .eq('game_id', gameId)
        .maybeSingle();

      if (existingScoreError) {
        console.error(existingScoreError);
        return res.status(500).json({ message: 'Server error' });
      }

      if (existingScore) {
        return res.status(409).json({
          message: 'Participant has already played this game',
        });
      }

      const { data: savedScore, error } = await supabase
        .from('Score')
        .insert({
          user_code: userCode,
          game_id: gameId,
          score: parsedScore,
          play_time: parsedPlayTime,
          metadata: metadata || {},
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
      }

      await deleteCacheByPrefix(`leaderboard:${gameId}:`);
      await deleteCacheByPrefix('scores:list:');

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
 * Each minigame player appears once with their personal best score.
 * Sorted by score descending; ties broken by shortest playTime.
 *
 * Optional query param: ?limit=N
 * - limit is a positive integer => return top N ranks
 * - limit is null/empty/omitted => return all ranked players
 */
router.get('/leaderboard/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const rawLimit = req.query.limit;
    const noLimitRequested =
      rawLimit === undefined ||
      rawLimit === null ||
      rawLimit === '' ||
      String(rawLimit).toLowerCase() === 'null';

    let limitValue = null;
    if (!noLimitRequested) {
      limitValue = Number(rawLimit);
      if (!Number.isInteger(limitValue) || limitValue <= 0) {
        return res
          .status(400)
          .json({ message: 'limit must be a positive integer or null' });
      }
    }

    const leaderboardCacheKey = `leaderboard:${gameId}:limit:${
      limitValue === null ? 'all' : limitValue
    }`;
    const cachedLeaderboard = await getCachedJson(leaderboardCacheKey);
    if (cachedLeaderboard) {
      return res.json(cachedLeaderboard);
    }

    const { data: game, error: gameError } = await supabase
      .from('Minigame')
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

    // One row per player per game – simple select + sort
    let query = supabase
      .from('Score')
      .select('user_code, score, play_time, updated_at')
      .eq('game_id', gameId)
      .order('score', { ascending: false }) 
      .order('play_time', { ascending: true })
      .order('updated_at', { ascending: true });

    if (limitValue !== null) {
      query = query.limit(limitValue);
    }

    const { data: board, error } = await query;

    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }

    const participantCodes = [...new Set((board || []).map((entry) => entry.user_code))];
    let participantNameByCode = new Map();

    if (participantCodes.length > 0) {
      const { data: participants, error: participantError } = await supabase
        .from('Participant')
        .select('minigameCode, fullName')
        .in('minigameCode', participantCodes);

      if (participantError) {
        console.error(participantError);
        return res.status(500).json({ message: 'Server error' });
      }

      participantNameByCode = new Map(
        (participants || []).map((participant) => [
          participant.minigameCode,
          participant.fullName,
        ])
      );
    }

    const ranked = (board || []).map((entry, i) => ({
      rank: i + 1,
      userCode: entry.user_code,
      playerName: participantNameByCode.get(entry.user_code) || entry.user_code,
      score: entry.score,
      playTime: entry.play_time,
      updatedAt: entry.updated_at,
    }));

    const payload = { gameId, gameName: game.name, leaderboard: ranked };
    await setCachedJson(
      leaderboardCacheKey,
      payload,
      LEADERBOARD_CACHE_TTL_SECONDS
    );

    return res.json(payload);
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
    const scoresListCacheKey = `scores:list:userCode:${
      req.query.userCode || 'all'
    }:gameId:${req.query.gameId || 'all'}`;
    const cachedScoresList = await getCachedJson(scoresListCacheKey);
    if (cachedScoresList) {
      return res.json(cachedScoresList);
    }

    let query = supabase
      .from('Score')
      .select(
        'id, user_code, game_id, score, play_time, metadata, created_at, updated_at, Minigame(name)'
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
      game: row.Minigame ? { name: row.Minigame.name } : null,
    }));

    await setCachedJson(
      scoresListCacheKey,
      response,
      SCORES_LIST_CACHE_TTL_SECONDS
    );

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
