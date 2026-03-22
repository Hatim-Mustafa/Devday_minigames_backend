const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const { supabase } = require('../config/db');
const { adminAuth } = require('../middleware/auth');
const {
  generateApiKey,
  hashApiKey,
  getApiKeyPrefix,
} = require('../utils/apiKey');

// Configure multer for in-memory file upload
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

const mapMinigame = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  imageUrl: row.image_url,
  location: row.location,
  isActive: row.is_active,
  hasApiKey: Boolean(row.api_key_hash),
  apiKeyPrefix: row.api_key_prefix || null,
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
      .from('Minigame')
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
      .from('Minigame')
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
 * Register a new minigame with optional image.
 * Body: { name, description?, isActive?, metadata? }
 * File: image (optional multipart form-data)
 */
router.post(
  '/',
  adminAuth,
  upload.single('image'),
  [body('name').notEmpty().withMessage('name is required').trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, isActive, metadata } = req.body;
    const generatedApiKey = generateApiKey();
    const generatedApiKeyHash = hashApiKey(generatedApiKey);
    const generatedApiKeyPrefix = getApiKeyPrefix(generatedApiKey);

    try {
      const { data: existing, error: existingError } = await supabase
        .from('Minigame')
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

      // Handle image upload if provided
      let imageUrl = null;
      if (req.file) {
        const allowedTypes = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(',');
        const maxSize = (parseInt(process.env.MAX_IMAGE_SIZE_MB, 10) || 5) * 1024 * 1024;

        if (!allowedTypes.includes(req.file.mimetype)) {
          return res.status(400).json({ message: 'Invalid image type. Allowed: jpeg, png, webp' });
        }

        if (req.file.buffer.length > maxSize) {
          return res.status(400).json({ message: `Image size exceeds ${process.env.MAX_IMAGE_SIZE_MB || 5}MB limit` });
        }

        try {
          const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'minigame-images';
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${req.file.originalname}`;
          const filePath = `${fileName}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, req.file.buffer, {
              contentType: req.file.mimetype,
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            console.error('Image upload error:', uploadError);
            return res.status(500).json({ message: 'Failed to upload image' });
          }

          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

          imageUrl = publicUrlData.publicUrl;
        } catch (uploadErr) {
          console.error('Image upload exception:', uploadErr);
          return res.status(500).json({ message: 'Failed to upload image' });
        }
      }

      const { data: game, error } = await supabase
        .from('Minigame')
        .insert({
          name,
          description: description || '',
          is_active: typeof isActive === 'boolean' ? isActive : true,
          api_key_hash: generatedApiKeyHash,
          api_key_prefix: generatedApiKeyPrefix,
          image_url: imageUrl,
          location: req.body.location || null,
          metadata: metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
      }

      return res.status(201).json({
        ...mapMinigame(game),
        apiKey: generatedApiKey,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * PUT /api/minigames/:id  [Admin only]
 * Update an existing minigame registration with optional image.
 */
router.put('/:id', adminAuth, upload.single('image'), async (req, res) => {
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
    if (Object.prototype.hasOwnProperty.call(req.body, 'location')) {
      updatePayload.location = req.body.location;
    }

    // Handle image upload if provided
    if (req.file) {
      const allowedTypes = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(',');
      const maxSize = (parseInt(process.env.MAX_IMAGE_SIZE_MB, 10) || 5) * 1024 * 1024;

      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: 'Invalid image type. Allowed: jpeg, png, webp' });
      }

      if (req.file.buffer.length > maxSize) {
        return res.status(400).json({ message: `Image size exceeds ${process.env.MAX_IMAGE_SIZE_MB || 5}MB limit` });
      }

      try {
        const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'minigame-images';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${req.file.originalname}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, req.file.buffer, {
            contentType: req.file.mimetype,
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          return res.status(500).json({ message: 'Failed to upload image' });
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        updatePayload.image_url = publicUrlData.publicUrl;
      } catch (uploadErr) {
        console.error('Image upload exception:', uploadErr);
        return res.status(500).json({ message: 'Failed to upload image' });
      }
    }

    const { data: game, error } = await supabase
      .from('Minigame')
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
 * POST /api/minigames/:id/rotate-key  [Admin only]
 * Generate a new API key for a minigame, invalidating the old one.
 */
router.post('/:id/rotate-key', adminAuth, async (req, res) => {
  try {
    const newApiKey = generateApiKey();
    const newApiKeyHash = hashApiKey(newApiKey);
    const newApiKeyPrefix = getApiKeyPrefix(newApiKey);

    const { data: game, error } = await supabase
      .from('Minigame')
      .update({
        api_key_hash: newApiKeyHash,
        api_key_prefix: newApiKeyPrefix,
        updated_at: new Date().toISOString(),
      })
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

    return res.json({
      ...mapMinigame(game),
      apiKey: newApiKey,
    });
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
      .from('Minigame')
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
