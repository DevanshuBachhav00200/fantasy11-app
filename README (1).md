# 🏏 Fantasy Cricket IPL — Full Stack App

## Folder Structure

```
fantasy-cricket/
├── backend/
│   ├── models/
│   │   ├── User.js           # User model with auth
│   │   ├── Player.js         # IPL player model
│   │   ├── Match.js          # Match + player performances
│   │   └── FantasyTeam.js    # User's selected team
│   ├── routes/
│   │   ├── auth.js           # Register, Login, Profile
│   │   ├── matches.js        # List, detail, players
│   │   ├── players.js        # Player listing
│   │   ├── teams.js          # Create/view fantasy teams
│   │   ├── leaderboard.js    # Rankings + user rank
│   │   ├── simulation.js     # Match simulation engine
│   │   └── admin.js          # Admin CRUD + stats
│   ├── middleware/
│   │   └── auth.js           # JWT auth + admin guard
│   ├── utils/
│   │   ├── fantasyPoints.js  # Scoring engine (Dream11 rules)
│   │   └── simulator.js      # Random match generator
│   ├── seed/
│   │   └── seedData.js       # 44 IPL players + 3 matches
│   ├── .env
│   ├── package.json
│   └── server.js             # Express + WebSocket server
│
└── frontend/                 # React Native (Expo)
    ├── src/
    │   ├── screens/
    │   │   ├── LoginScreen.js         # Auth UI
    │   │   ├── HomeScreen.js          # Match listing
    │   │   ├── MatchDetailScreen.js   # Match + live score
    │   │   ├── TeamSelectionScreen.js # Player picker
    │   │   ├── LeaderboardScreen.js   # Rankings
    │   │   ├── MyTeamsScreen.js       # User's teams
    │   │   └── ProfileScreen.js       # User profile
    │   ├── services/
    │   │   └── api.js          # Axios API client
    │   ├── context/
    │   │   └── AuthContext.js  # JWT auth state
    │   └── utils/
    │       └── useMatchSocket.js  # WebSocket hook
    ├── App.js                  # Navigation setup
    ├── .env
    └── package.json
```

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env        # Set MONGODB_URI, JWT_SECRET
npm run seed                # Seed IPL players & matches
npm run dev                 # Start on port 5000
```

### Frontend
```bash
cd frontend
npm install
npx expo start              # Scan QR code with Expo Go
```

## REST API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login → JWT |
| GET | /api/auth/me | Get current user |

### Matches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/matches | List all matches |
| GET | /api/matches?status=live | Filter by status |
| GET | /api/matches/:id | Match details |
| GET | /api/matches/:id/players | Players for selection |

### Fantasy Teams
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/teams | Create/update team |
| GET | /api/teams/my | My teams |
| GET | /api/teams/match/:id | My team for match |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/leaderboard/:matchId | Match leaderboard |
| GET | /api/leaderboard/:matchId/my-rank | User rank |
| GET | /api/leaderboard/global/top | All-time top 50 |

### Simulation (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/simulation/start/:id | Start match (locks teams) |
| POST | /api/simulation/complete/:id | Simulate + calc points |
| POST | /api/simulation/live-update/:id | Broadcast live ball |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/admin/matches | Create match |
| PUT | /api/admin/matches/:id | Update match |
| POST | /api/admin/players | Add player |
| GET | /api/admin/stats | Dashboard stats |

## Fantasy Points System

### Batting
| Event | Points |
|-------|--------|
| Every run | +1 |
| Boundary (4) | +1 bonus |
| Six | +2 bonus |
| 30+ runs | +4 |
| 50+ runs | +8 |
| 100+ runs | +16 |
| Duck (0 runs) | -2 |
| Strike rate > 170 | +6 |
| Strike rate < 50 | -6 |

### Bowling
| Event | Points |
|-------|--------|
| Each wicket | +25 |
| 3-wicket haul | +4 bonus |
| 4-wicket haul | +8 bonus |
| 5-wicket haul | +16 bonus |
| Maiden over | +12 |
| Economy < 5 | +6 |
| Economy > 12 | -6 |

### Fielding
| Event | Points |
|-------|--------|
| Catch | +8 |
| 3+ catches | +4 bonus |
| Stumping | +12 |
| Run out (direct) | +12 |

### Multipliers
- **Captain**: 2× total points
- **Vice-Captain**: 1.5× total points

## Team Selection Rules
- Exactly **11 players** required
- Max **100 credits** total
- **1 Captain** (2× multiplier)
- **1 Vice-Captain** (1.5× multiplier)
- Role constraints:
  - 1–4 Wicket-keepers
  - 3–6 Batsmen
  - 1–4 All-rounders
  - 3–6 Bowlers

## WebSocket Events

Connect: `ws://localhost:5000?matchId=<matchId>`

| Event | Payload |
|-------|---------|
| MATCH_STARTED | `{ type, matchId, message }` |
| MATCH_COMPLETED | `{ type, matchId, result, topPerformers }` |
| LIVE_UPDATE | `{ type, over, ball, runs, wicket, commentary }` |

## Demo Credentials
- **Admin**: admin@fantasycricket.com / admin123
- **User**: virat@demo.com / demo123

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React Native (Expo) |
| Navigation | React Navigation v6 |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Real-time | WebSockets (ws) |
| Storage | Expo SecureStore |
