# Devday Minigames Backend

Central backend for the numerous minigames that will be played on the event day.

## Architecture

```
/
├── backend/    Node.js + Express + Supabase (Postgres) REST API
└── frontend/   React admin panel (Vite)
```

Each minigame only needs to make **two API calls** to this backend:

| Call | Endpoint | Purpose |
|------|----------|---------|
| 1 | `GET /api/users/username/:userCode` | Look up a participant's username from their badge/QR code |
| 2 | `POST /api/scores` | Submit a score for a participant |

The admin panel is used to register games and manage participants; it has no coupling with any individual minigame's frontend.

---

## Backend Setup

### Prerequisites
- Node.js ≥ 18
- Supabase project

### Install & run

```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev            # development (nodemon)
# or
npm start              # production
```

### Environment variables (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Port the API listens on (default `5000`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key used by backend API |
| `JWT_SECRET` | Secret used to sign admin JWTs |
| `ADMIN_SECRET` | Plain-text password for the admin login endpoint |

---

## API Reference

### Public endpoints (used by minigames)

#### Get username from user code
```
GET /api/users/username/:userCode
```
Response `200 OK`:
```json
{ "userCode": "U001", "username": "Alice" }
```

#### Submit a score
```
POST /api/scores
Content-Type: application/json

{
  "userCode": "U001",
  "gameId":   "<minigame UUID>",
  "score":    42,
  "playTime": 31.5,
  "metadata": {}   // optional – any extra per-game data
}
```
Response `200 OK`: the saved/updated score document.

---

### Admin endpoints

All admin write operations require an `Authorization: Bearer <token>` header.

#### Admin login
```
POST /api/admin/login
{ "secret": "<ADMIN_SECRET>" }
```
Returns `{ "token": "..." }` (valid for 8 hours).

#### Minigames (CRUD)
```
GET    /api/minigames          # list all
GET    /api/minigames/:id      # get one
POST   /api/minigames          # register new  [admin]
PUT    /api/minigames/:id      # update        [admin]
DELETE /api/minigames/:id      # remove        [admin]
```

#### Users / Participants
```
GET  /api/users     # list all
POST /api/users     # add participant  { userCode, username }
```

#### Scores
```
GET /api/scores              # list all
GET /api/scores?userCode=…   # filter by user
GET /api/scores?gameId=…     # filter by game
```

---

## Admin Panel (Frontend) Setup

```bash
cd frontend
cp .env.example .env   # set VITE_API_URL if needed
npm install
npm run dev            # http://localhost:5173
```

The admin panel provides:
- **Minigames** – register, activate/deactivate, and delete minigames
- **Participants** – add and view participants
- **Scores** – view and filter score submissions

---

## Running Tests

```bash
cd backend
npm test
```

---

## Data Models

### User
| Field | Type | Description |
|-------|------|-------------|
| `userCode` | String (unique) | Badge / QR code identifier |
| `username` | String | Display name |
| `metadata` | Mixed | Any additional participant info |

### Score
| Field | Type | Description |
|-------|------|-------------|
| `userCode` | String | Reference to User.userCode |
| `gameId` | UUID | Reference to Minigame |
| `score` | Number | Numeric score value |
| `playTime` | Number | Completion time (lower is better for tie-breaks) |
| `metadata` | Mixed | Optional per-game extra data |

### Minigame
| Field | Type | Description |
|-------|------|-------------|
| `name` | String (unique) | Game name |
| `description` | String | Short description |
| `isActive` | Boolean | Whether the game accepts new scores |
| `metadata` | Mixed | Any additional registration details |

> **Note:** Specific field requirements for minigame registration are not yet finalised. The `metadata` field on all models is a flexible catch-all for future additions.

