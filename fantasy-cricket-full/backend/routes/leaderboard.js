const express = require('express');
const router = express.Router();
const FantasyTeam = require('../models/FantasyTeam');
const { auth } = require('../middleware/auth');

// GET /api/leaderboard/:matchId - Match leaderboard
router.get('/:matchId', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const teams = await FantasyTeam.find({ match: req.params.matchId })
      .populate('user', 'username avatar')
      .populate('players.player', 'name role team')
      .sort({ totalPoints: -1, createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Add rank
    const rankedTeams = teams.map((team, idx) => ({
      ...team.toObject(),
      rank: skip + idx + 1
    }));

    const total = await FantasyTeam.countDocuments({ match: req.params.matchId });

    res.json({
      leaderboard: rankedTeams,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leaderboard/:matchId/my-rank - Get user's rank
router.get('/:matchId/my-rank', auth, async (req, res) => {
  try {
    const myTeam = await FantasyTeam.findOne({
      user: req.user._id,
      match: req.params.matchId
    });

    if (!myTeam) return res.status(404).json({ error: 'No team for this match' });

    const betterTeams = await FantasyTeam.countDocuments({
      match: req.params.matchId,
      totalPoints: { $gt: myTeam.totalPoints }
    });

    const total = await FantasyTeam.countDocuments({ match: req.params.matchId });

    res.json({
      rank: betterTeams + 1,
      totalParticipants: total,
      totalPoints: myTeam.totalPoints,
      percentile: Math.round(((total - betterTeams) / total) * 100)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leaderboard/global/top - All-time top players
router.get('/global/top', async (req, res) => {
  try {
    const topUsers = await FantasyTeam.aggregate([
      { $group: { _id: '$user', totalPoints: { $sum: '$totalPoints' }, matches: { $sum: 1 } } },
      { $sort: { totalPoints: -1 } },
      { $limit: 50 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { 'user.password': 0 } }
    ]);

    res.json({ leaderboard: topUsers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
