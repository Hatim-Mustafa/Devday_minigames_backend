const express = require('express');
const { supabase } = require('../config/db');

const router = express.Router();

/**
 * GET /api/participants/:minigameCode
 * Public lookup endpoint to resolve participant identity by minigameCode.
 */
router.get('/:minigameCode', async (req, res) => {
  try {
    const { minigameCode } = req.params;

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

    return res.json({
      fullName: participant.fullName,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
