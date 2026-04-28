const express = require('express');
const { supabase } = require('../config/db');

const router = express.Router();

/**
 * GET /api/participants/:minigameCode
 * Public lookup endpoint to resolve participant identity by minigameCode.
 * Optionally accepts gameId to ensure the participant has not already played
 * that game.
 */
router.get('/:minigameCode', async (req, res) => {
  try {
    const { minigameCode } = req.params;
    const { gameId } = req.query;

    if (!minigameCode || !String(minigameCode).trim()) {
      return res.status(400).json({ message: 'minigameCode is required' });
    }

    const { data: participant, error } = await supabase
      .from('Participant')
      .select('fullName')
      .eq('minigameCode', minigameCode)
      .maybeSingle();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    if (gameId) {
      const { data: existingScore, error: scoreError } = await supabase
        .from('Score')
        .select('id')
        .eq('user_code', minigameCode)
        .eq('game_id', gameId)
        .maybeSingle();

      if (scoreError) {
        console.error(scoreError);
        return res.status(500).json({ message: 'Server error' });
      }

      if (existingScore) {
        return res.status(409).json({
          message: 'Participant has already played this game',
        });
      }
    }

    return res.json({
      fullName: participant.fullName,
      canPlay: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
