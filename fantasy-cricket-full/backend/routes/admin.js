const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const Player = require('../models/Player');
const { adminAuth } = require('../middleware/auth');

// POST /api/admin/matches - Create match
router.post('/matches', adminAuth, async (req, res) => {
  try {
    const { team1, team2, venue, scheduledAt, team1Players, team2Players, prizePool } = req.body;

    const match = new Match({
      team1, team2, venue, scheduledAt,
      team1Players, team2Players,
      prizePool: prizePool || 10000
    });
    await match.save();

    res.status(201).json({ match, message: 'Match created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/matches/:id - Update match
router.put('/matches/:id', adminAuth, async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!match) return res.status(404).json({ error: 'Match not found' });
    res.json({ match });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/matches/:id
router.delete('/matches/:id', adminAuth, async (req, res) => {
  try {
    await Match.findByIdAndDelete(req.params.id);
    res.json({ message: 'Match deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/players - Create player
router.post('/players', adminAuth, async (req, res) => {
  try {
    const player = new Player(req.body);
    await player.save();
    res.status(201).json({ player });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/players/:id - Update player
router.put('/players/:id', adminAuth, async (req, res) => {
  try {
    const player = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ player });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stats - Dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [matches, players, teams] = await Promise.all([
      Match.countDocuments(),
      Player.countDocuments(),
      require('../models/FantasyTeam').countDocuments()
    ]);
    const liveMatches = await Match.countDocuments({ status: 'live' });
    res.json({ matches, players, teams, liveMatches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
