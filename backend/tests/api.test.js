/**
 * Basic API smoke tests.
 * These tests use supertest against the Express app with a mocked Mongoose
 * to avoid requiring a real MongoDB instance in CI.
 */
const request = require('supertest');

// Set required env vars before loading the app
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.ADMIN_SECRET = 'test_admin_secret';
process.env.MONGO_URI = 'mongodb://localhost:27017/test';

// Mock mongoose so no real DB connection is required
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue({ connection: { host: 'mock' } }),
  };
});

// Mock models
jest.mock('../models/User');
jest.mock('../models/Score');
jest.mock('../models/Minigame');

const User = require('../models/User');
const Score = require('../models/Score');
const Minigame = require('../models/Minigame');
const app = require('../server');

// ── Health check ──────────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

// ── Admin login ───────────────────────────────────────────────────────────────

describe('POST /api/admin/login', () => {
  it('returns a token with the correct secret', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({ secret: 'test_admin_secret' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('rejects an incorrect secret', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({ secret: 'wrong_secret' });
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 when secret is missing', async () => {
    const res = await request(app).post('/api/admin/login').send({});
    expect(res.statusCode).toBe(400);
  });
});

// ── Users – GET username ──────────────────────────────────────────────────────

describe('GET /api/users/username/:userCode', () => {
  it('returns username for a known userCode', async () => {
    User.findOne = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        userCode: 'U001',
        username: 'Alice',
      }),
    });

    const res = await request(app).get('/api/users/username/U001');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ userCode: 'U001', username: 'Alice' });
  });

  it('returns 404 for an unknown userCode', async () => {
    User.findOne = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app).get('/api/users/username/UNKNOWN');
    expect(res.statusCode).toBe(404);
  });
});

// ── Scores – POST ─────────────────────────────────────────────────────────────

describe('POST /api/scores', () => {
  const validBody = {
    userCode: 'U001',
    gameId: '507f1f77bcf86cd799439011',
    score: 42,
  };

  it('saves a score and returns 201', async () => {
    User.findOne = jest.fn().mockResolvedValue({ userCode: 'U001' });
    Minigame.findById = jest
      .fn()
      .mockResolvedValue({ _id: validBody.gameId, isActive: true });
    Score.create = jest.fn().mockResolvedValue({ ...validBody, _id: 'score1' });

    const res = await request(app).post('/api/scores').send(validBody);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('score', 42);
  });

  it('returns 404 when user does not exist', async () => {
    User.findOne = jest.fn().mockResolvedValue(null);

    const res = await request(app).post('/api/scores').send(validBody);
    expect(res.statusCode).toBe(404);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/scores')
      .send({ userCode: 'U001' });
    expect(res.statusCode).toBe(400);
  });
});

// ── Minigames – CRUD ──────────────────────────────────────────────────────────

describe('GET /api/minigames', () => {
  it('returns a list of minigames', async () => {
    Minigame.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([{ name: 'Snake', isActive: true }]),
      }),
    });

    const res = await request(app).get('/api/minigames');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/minigames', () => {
  let adminToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({ secret: 'test_admin_secret' });
    adminToken = res.body.token;
  });

  it('registers a minigame with a valid admin token', async () => {
    Minigame.findOne = jest.fn().mockResolvedValue(null);
    Minigame.create = jest
      .fn()
      .mockResolvedValue({ name: 'Snake', isActive: true });

    const res = await request(app)
      .post('/api/minigames')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Snake', description: 'Classic snake game' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', 'Snake');
  });

  it('rejects minigame creation without a token', async () => {
    const res = await request(app)
      .post('/api/minigames')
      .send({ name: 'Snake' });
    expect(res.statusCode).toBe(401);
  });
});
