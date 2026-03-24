require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const matchRoutes = require('./routes/matches');
const playerRoutes = require('./routes/players');
const teamRoutes = require('./routes/teams');
const leaderboardRoutes = require('./routes/leaderboard');
const adminRoutes = require('./routes/admin');
const simulationRoutes = require('./routes/simulation');

const app = express();
const server = http.createServer(app);

// WebSocket Server
const wss = new WebSocket.Server({ server });
const clients = new Map(); // matchId -> Set of ws clients

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const matchId = url.searchParams.get('matchId');

  if (matchId) {
    if (!clients.has(matchId)) clients.set(matchId, new Set());
    clients.get(matchId).add(ws);
    console.log(`WS client joined match: ${matchId}`);
  }

  ws.on('close', () => {
    if (matchId && clients.has(matchId)) {
      clients.get(matchId).delete(ws);
    }
  });
});

// Broadcast to all clients watching a match
global.broadcast = (matchId, data) => {
  if (clients.has(matchId)) {
    const message = JSON.stringify(data);
    clients.get(matchId).forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) ws.send(message);
    });
  }
};

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/simulation', simulationRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date() }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fantasy_cricket';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = { app, wss };
