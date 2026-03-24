const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const { auth } = require('../middleware/auth');

// GET /api/matches - List all matches
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const matches = await Match.find(filter)
      .populate('team1Players', 'name role credits team avatar')
      .populate('team2Players', 'name role credits team avatar')
      .sort({ scheduledAt: 1 });
    res.json({ matches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/matches/:id - Get single match
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('team1Players', 'name role credits team avatar stats')
      .populate('team2Players', 'name role credits team avatar stats')
      .populate('performances.player', 'name role team avatar');
    if (!match) return res.status(404).json({ error: 'Match not found' });
    res.json({ match });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/matches/:id/players - Get players for a match (for team selection)
router.get('/:id/players', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('team1Players team2Players', 'name role credits team avatar stats basePoints');
    if (!match) return res.status(404).json({ error: 'Match not found' });

    const allPlayers = [
      ...match.team1Players.map(p => ({ ...p.toObject(), matchTeam: 'team1' })),
      ...match.team2Players.map(p => ({ ...p.toObject(), matchTeam: 'team2' }))
    ];

    res.json({ players: allPlayers, match: { team1: match.team1, team2: match.team2 } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
