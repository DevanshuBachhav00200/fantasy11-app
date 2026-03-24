const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

// GET /api/players - List all players
router.get('/', async (req, res) => {
  try {
    const { team, role, search } = req.query;
    const filter = { isActive: true };
    if (team) filter.team = team;
    if (role) filter.role = role;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const players = await Player.find(filter).sort({ credits: -1 });
    res.json({ players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/players/:id
router.get('/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json({ player });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
