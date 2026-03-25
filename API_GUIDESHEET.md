# Devday Minigames API Guidesheet

This guide documents the 3 APIs used by minigame clients:

1. Code -> Name lookup API
2. Score submission API
3. Leaderboard API

It is based on the current backend implementation under `backend/routes`.

## 1) Quick Summary

- Base URL (local): `http://localhost:5000`
- Base URL (production): `https://minigame-manager-cc533de7be66.herokuapp.com`
- API prefix: `/api`
- Content type for POST: `application/json`
- Response format: JSON
- Public endpoints in this guide:
  - `GET /api/participants/:minigameCode` (code -> participant name)
  - `POST /api/scores` (submit or update score)
  - `GET /api/scores/leaderboard/:gameId` (ranked leaderboard)

## 2) Authentication and Access Rules

### Which endpoints need an API key?

- `GET /api/participants/:minigameCode`: No API key required.
- `POST /api/scores`: Requires `x-api-key` header.
- `GET /api/scores/leaderboard/:gameId`: No API key required.

### `x-api-key` rules for score submission

For `POST /api/scores`, include:

```http
x-api-key: <MINIGAME_API_KEY>
```

The backend validates:

- API key exists
- API key is valid (matches a registered minigame)
- Minigame tied to key is active
- `gameId` in request body belongs to that same minigame

If any check fails, request is rejected.

## 3) Global Behavior and Limits

- Global rate limiting: 100 requests per minute per IP.
- If exceeded: HTTP `429` with:

```json
{
  "message": "Too many requests, please try again later."
}
```

## 4) API 1: Code -> Name Lookup

Resolves a participant's minigame code to their full name.

## Endpoint

`GET /api/participants/:minigameCode`

## Path parameter

- `minigameCode` (string, required)

## Example request

```bash
curl -X GET "http://localhost:5000/api/participants/U001"
```

## Success response

- Status: `200 OK`

```json
{
  "fullName": "Aisha Khan"
}
```

## Error responses

- `400 Bad Request`

```json
{
  "message": "minigameCode is required"
}
```

- `404 Not Found`

```json
{
  "message": "Participant not found"
}
```

- `500 Internal Server Error`

```json
{
  "message": "Server error"
}
```

## Notes

- Response only includes `fullName`.
- If code does not exist, API returns `404` (not an empty object).

## 5) API 2: Score Submission

Creates or updates one score per `(userCode, gameId)` pair.

## Endpoint

`POST /api/scores`

## Headers

- `Content-Type: application/json`
- `x-api-key: <MINIGAME_API_KEY>` (required)

## Request body

```json
{
  "userCode": "U001",
  "gameId": "36f7208b-b2db-4f98-a1c8-6ef8b52c1174",
  "score": 42,
  "playTime": 31.5,
  "metadata": {
    "level": 3,
    "difficulty": "hard"
  }
}
```

### Field requirements

- `userCode`: required, non-empty string
- `gameId`: required
- `score`: required, numeric (`isFloat`)
- `playTime`: required, numeric and `>= 0`
- `metadata`: optional JSON object (defaults to `{}`)

## Example request

```bash
curl -X POST "http://localhost:5000/api/scores" \
  -H "Content-Type: application/json" \
  -H "x-api-key: <MINIGAME_API_KEY>" \
  -d '{
    "userCode": "U001",
    "gameId": "36f7208b-b2db-4f98-a1c8-6ef8b52c1174",
    "score": 42,
    "playTime": 31.5,
    "metadata": {"round": 1}
  }'
```

## Success response

- Status: `200 OK`

```json
{
  "id": "44efb7fb-0788-4f95-b6e9-b50735ad48f8",
  "userCode": "U001",
  "gameId": "36f7208b-b2db-4f98-a1c8-6ef8b52c1174",
  "score": 42,
  "playTime": 31.5,
  "metadata": {
    "round": 1
  },
  "createdAt": "2026-03-25T11:20:00.000Z",
  "updatedAt": "2026-03-25T11:20:00.000Z"
}
```

## Upsert behavior (important)

- Backend performs upsert on unique key `(user_code, game_id)`.
- This means a second submission for the same user and same game updates the existing row instead of creating a duplicate.
- Current implementation overwrites with latest submitted values.

## Error responses

### Validation errors from request body

- Status: `400 Bad Request`
- Shape:

```json
{
  "errors": [
    {
      "type": "field",
      "msg": "userCode is required",
      "path": "userCode",
      "location": "body"
    }
  ]
}
```

Possible validation messages:

- `userCode is required`
- `gameId is required`
- `score must be a number`
- `playTime must be a non-negative number`

### API key / authorization errors

- `401 Unauthorized`

```json
{
  "message": "x-api-key header is required"
}
```

- `401 Unauthorized`

```json
{
  "message": "Invalid API key"
}
```

- `403 Forbidden`

```json
{
  "message": "Minigame is not active for API access"
}
```

- `400 Bad Request`

```json
{
  "message": "gameId is required"
}
```

- `403 Forbidden`

```json
{
  "message": "API key is not authorized for this gameId"
}
```

### Entity errors

- `404 Not Found`

```json
{
  "message": "Minigame player not found"
}
```

- `404 Not Found`

```json
{
  "message": "Minigame not found"
}
```

- `403 Forbidden`

```json
{
  "message": "Minigame is not active"
}
```

### Server error

- `500 Internal Server Error`

```json
{
  "message": "Server error"
}
```

## 6) API 3: Leaderboard

Returns ranked entries for one game.

## Endpoint

`GET /api/scores/leaderboard/:gameId`

## Path parameter

- `gameId` (required)

## Query parameter

- `limit` (optional)

Rules:

- If omitted, empty, or `null`, all ranked entries are returned.
- If provided, must be a positive integer.
- Invalid limit returns `400`.

Examples:

- All: `GET /api/scores/leaderboard/<gameId>`
- Top 10: `GET /api/scores/leaderboard/<gameId>?limit=10`
- All (explicit): `GET /api/scores/leaderboard/<gameId>?limit=null`

## Ranking logic

Sorting order is:

1. `score` descending (higher is better)
2. `playTime` ascending (lower time wins tie)
3. `updatedAt` ascending

Returned `rank` starts at 1.

## Example request

```bash
curl -X GET "http://localhost:5000/api/scores/leaderboard/36f7208b-b2db-4f98-a1c8-6ef8b52c1174?limit=10"
```

## Success response

- Status: `200 OK`

```json
{
  "gameId": "36f7208b-b2db-4f98-a1c8-6ef8b52c1174",
  "gameName": "Reaction Rush",
  "leaderboard": [
    {
      "rank": 1,
      "userCode": "U009",
      "score": 97,
      "playTime": 25.1,
      "updatedAt": "2026-03-25T10:10:10.000Z"
    },
    {
      "rank": 2,
      "userCode": "U001",
      "score": 94,
      "playTime": 28.6,
      "updatedAt": "2026-03-25T10:12:00.000Z"
    }
  ]
}
```

## Error responses

- `400 Bad Request`

```json
{
  "message": "limit must be a positive integer or null"
}
```

- `404 Not Found`

```json
{
  "message": "Minigame not found"
}
```

- `500 Internal Server Error`

```json
{
  "message": "Server error"
}
```

## 7) Caching Notes

Backend caches:

- Leaderboard responses with key pattern: `leaderboard:<gameId>:limit:<value>`
- Default leaderboard cache TTL: 15 seconds (`REDIS_LEADERBOARD_TTL_SECONDS`)

## 8) CORS and Multi-Developer Integrations

This backend uses CORS allowlisting via `CORS_ALLOWED_ORIGINS`.

Behavior:

- If `CORS_ALLOWED_ORIGINS` is empty, all browser origins are allowed.
- If `CORS_ALLOWED_ORIGINS` has values, only listed origins are allowed.

Important:

- CORS only applies to browser-based requests.
- Server-to-server calls, mobile apps, and backend cron jobs are not blocked by browser CORS.
- Security for partner integrations should rely on API keys, auth, and rate limits, not only CORS.

For multiple game developers:

- If a partner calls APIs from their own backend, no CORS origin entry is required.
- If a partner calls APIs directly from a browser game, their exact origin must be allowlisted.

Example env value:

```env
CORS_ALLOWED_ORIGINS=https://devday-games.vercel.app,https://partner1.example.com,https://partner2.example.com
```

Recommended long-term approach:

- Keep strict `x-api-key` validation per minigame.
- Add per-partner or per-api-key origin allowlists if browser-based integrations grow.

Implications:

- Leaderboard may be stale for a few seconds after heavy traffic.
- On score submission, leaderboard cache for that game is invalidated.

## 8) Integration Checklist for Minigame Teams

1. Obtain your `gameId` and private `MINIGAME_API_KEY` from admin.
2. Validate user code first using `GET /api/participants/:minigameCode`.
3. Submit score using `POST /api/scores` with your `x-api-key`.
4. Show rankings using `GET /api/scores/leaderboard/:gameId`.
5. Handle expected failures (`400`, `401`, `403`, `404`, `429`, `500`).

## 9) Recommended Client-Side Error Handling

- `400`: Fix request payload/query before retry.
- `401`: Missing/invalid API key; refresh config/secrets.
- `403`: Key is valid but not allowed for this game or game is inactive.
- `404`: Invalid participant code or unknown game.
- `429`: Back off and retry later.
- `500`: Retry with exponential backoff and log incident.

## 10) End-to-End Example Flow

1. User enters minigame code `U001`.
2. Client calls `GET /api/participants/U001` and receives `fullName`.
3. Game finishes; client posts score with `x-api-key` to `POST /api/scores`.
4. Client fetches `GET /api/scores/leaderboard/:gameId?limit=10` to display top ranks.
