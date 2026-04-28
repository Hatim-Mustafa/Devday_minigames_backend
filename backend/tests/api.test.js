/**
 * Basic API smoke tests.
 * These tests use supertest against the Express app with a mocked Supabase
 * client so no real DB connection is required.
 */
const request = require('supertest');
const { hashApiKey } = require('../utils/apiKey');

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

const TEST_API_KEY = 'mgk_test_api_key';
const TEST_API_KEY_HASH = hashApiKey(TEST_API_KEY);

const buildMaybeSingleQuery = (result) => {
  const query = {
    select: jest.fn(() => query),
    eq: jest.fn(() => query),
    maybeSingle: jest.fn().mockResolvedValue(result),
  };
  return query;
};

const buildScoreTableMock = ({ existingScore, insertedScore }) => {
  const query = {
    select: jest.fn(() => query),
    eq: jest.fn(() => query),
    maybeSingle: jest.fn().mockResolvedValue(existingScore),
    insert: jest.fn(() => query),
    single: jest.fn().mockResolvedValue(insertedScore),
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

describe('POST /api/scores', () => {
  it('creates a score and returns 200', async () => {
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'Minigame') {
        return buildMaybeSingleQuery({
          data: { id: 'game-1', name: 'Game 1', is_active: true },
          error: null,
        });
      }

      if (table === 'Participant') {
        return buildMaybeSingleQuery({
          data: { id: 'user-1' },
          error: null,
        });
      }

      if (table === 'Score') {
        return buildScoreTableMock({
          existingScore: { data: null, error: null },
          insertedScore: {
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
          },
        });
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    const res = await request(app)
      .post('/api/scores')
      .set('x-api-key', TEST_API_KEY)
      .send({
        userCode: 'U001',
        gameId: 'game-1',
        score: 42,
        playTime: 30,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('score', 42);
    expect(res.body).toHaveProperty('playTime', 30);
  });

  it('rejects a second score submission for the same game', async () => {
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'Minigame') {
        return buildMaybeSingleQuery({
          data: { id: 'game-1', name: 'Game 1', is_active: true },
          error: null,
        });
      }

      if (table === 'Participant') {
        return buildMaybeSingleQuery({
          data: { id: 'user-1' },
          error: null,
        });
      }

      if (table === 'Score') {
        return buildScoreTableMock({
          existingScore: { data: { id: 'score-1' }, error: null },
          insertedScore: { data: null, error: null },
        });
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    const res = await request(app)
      .post('/api/scores')
      .set('x-api-key', TEST_API_KEY)
      .send({
        userCode: 'U001',
        gameId: 'game-1',
        score: 42,
        playTime: 30,
      });

    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty(
      'message',
      'Participant has already played this game'
    );
  });
});

describe('GET /api/participants/:minigameCode', () => {
  it('returns the participant name when the player has not played the game', async () => {
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'Participant') {
        return buildMaybeSingleQuery({
          data: { fullName: 'Aisha Khan' },
          error: null,
        });
      }

      if (table === 'Score') {
        return buildMaybeSingleQuery({ data: null, error: null });
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    const res = await request(app).get('/api/participants/U001?gameId=game-1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ fullName: 'Aisha Khan', canPlay: true });
  });

  it('rejects lookup when the player already played the game', async () => {
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'Participant') {
        return buildMaybeSingleQuery({
          data: { fullName: 'Aisha Khan' },
          error: null,
        });
      }

      if (table === 'Score') {
        return buildMaybeSingleQuery({ data: { id: 'score-1' }, error: null });
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    const res = await request(app).get('/api/participants/U001?gameId=game-1');

    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty(
      'message',
      'Participant has already played this game'
    );
  });
});
