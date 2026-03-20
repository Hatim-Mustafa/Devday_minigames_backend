/**
 * Basic API smoke tests.
 * These tests use supertest against the Express app with a mocked Supabase
 * client so no real DB connection is required.
 */
const request = require('supertest');

// Set required env vars before loading the app
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.ADMIN_SECRET = 'test_admin_secret';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

const mockSupabase = {
  from: jest.fn(),
};

jest.mock('../config/db', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
  supabase: mockSupabase,
}));

const app = require('../server');

const buildMaybeSingleQuery = (result) => {
  const query = {
    select: jest.fn(() => query),
    eq: jest.fn(() => query),
    maybeSingle: jest.fn().mockResolvedValue(result),
  };
  return query;
};

const buildUpsertQuery = (result) => {
  const query = {
    upsert: jest.fn(() => query),
    select: jest.fn(() => query),
    single: jest.fn().mockResolvedValue(result),
  };
  return query;
};

beforeEach(() => {
  mockSupabase.from.mockReset();
});

describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

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
});

describe('GET /api/users/username/:userCode', () => {
  it('returns username for a known userCode', async () => {
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'users') {
        return buildMaybeSingleQuery({
          data: { user_code: 'U001', username: 'Alice' },
          error: null,
        });
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    const res = await request(app).get('/api/users/username/U001');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ userCode: 'U001', username: 'Alice' });
  });

  it('returns 404 for an unknown userCode', async () => {
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'users') {
        return buildMaybeSingleQuery({ data: null, error: null });
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    const res = await request(app).get('/api/users/username/UNKNOWN');
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/scores', () => {
  it('upserts a score and returns 200', async () => {
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'users') {
        return buildMaybeSingleQuery({ data: { id: 'user-1' }, error: null });
      }

      if (table === 'minigames') {
        return buildMaybeSingleQuery({
          data: { id: 'game-1', is_active: true },
          error: null,
        });
      }

      if (table === 'scores') {
        return buildUpsertQuery({
          data: {
            id: 'score-1',
            user_code: 'U001',
            game_id: 'game-1',
            score: 42,
            play_time: 30,
            metadata: {},
            created_at: '2026-03-18T10:00:00.000Z',
            updated_at: '2026-03-18T10:00:00.000Z',
          },
          error: null,
        });
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    const res = await request(app).post('/api/scores').send({
      userCode: 'U001',
      gameId: 'game-1',
      score: 42,
      playTime: 30,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('score', 42);
    expect(res.body).toHaveProperty('playTime', 30);
  });
});
