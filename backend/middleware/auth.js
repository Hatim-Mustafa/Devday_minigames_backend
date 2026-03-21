const jwt = require('jsonwebtoken');
const { supabase } = require('../config/db');
const { hashApiKey } = require('../utils/apiKey');

/**
 * Middleware that protects admin-only routes.
 * Expects an `Authorization: Bearer <token>` header where the token was
 * issued by the admin login endpoint.
 */
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Middleware that protects minigame-facing public endpoints using a per-game
 * API key sent as `x-api-key`.
 *
 * options.requireGameIdFromBody=true enforces that req.body.gameId matches
 * the minigame associated with the provided API key.
 */
const minigameApiKeyAuth = (options = {}) => async (req, res, next) => {
  const { requireGameIdFromBody = false } = options;
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ message: 'x-api-key header is required' });
  }

  try {
    const apiKeyHash = hashApiKey(apiKey);

    const { data: minigame, error } = await supabase
      .from('Minigame')
      .select('id, name, is_active')
      .eq('api_key_hash', apiKeyHash)
      .maybeSingle();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!minigame) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    if (!minigame.is_active) {
      return res
        .status(403)
        .json({ message: 'Minigame is not active for API access' });
    }

    if (requireGameIdFromBody) {
      const { gameId } = req.body;
      if (!gameId) {
        return res.status(400).json({ message: 'gameId is required' });
      }
      if (gameId !== minigame.id) {
        return res.status(403).json({
          message: 'API key is not authorized for this gameId',
        });
      }
    }

    req.minigameAuth = {
      id: minigame.id,
      name: minigame.name,
    };

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { adminAuth, minigameApiKeyAuth };
