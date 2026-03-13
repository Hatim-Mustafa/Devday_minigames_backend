const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const router = express.Router();

/**
 * POST /api/admin/login
 *
 * Simple admin authentication using a shared secret configured via the
 * ADMIN_SECRET environment variable.  Returns a short-lived JWT that must be
 * sent as `Authorization: Bearer <token>` on all admin-only routes.
 *
 * Body: { secret }
 */
router.post(
  '/login',
  [body('secret').notEmpty().withMessage('secret is required')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { secret } = req.body;

    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ message: 'Invalid admin secret' });
    }

    const token = jwt.sign(
      { isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({ token });
  }
);

module.exports = router;
