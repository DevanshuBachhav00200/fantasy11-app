const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const Player = require('../models/Player');
const FantasyTeam = require('../models/FantasyTeam');
const { adminAuth } = require('../middleware/auth');
const { simulateMatch } = require('../utils/simulator');
const { calculateTeamPoints } = require('../utils/fantasyPoints');

// POST /api/simulation/start/:matchId - Start live simulation
router.post('/start/:matchId', adminAuth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId)
      .populate('team1Players team2Players');

    if (!match) return res.status(404).json({ error: 'Match not found' });
    if (match.status !== 'upcoming')
      return res.status(400).json({ error: 'Match already started or completed' });

    // Update match to live
    match.status = 'live';
    await match.save();

    // Lock all fantasy teams
    await FantasyTeam.updateMany({ match: match._id }, { isLocked: true });

    // Broadcast live start
    global.broadcast(match._id.toString(), {
      type: 'MATCH_STARTED',
      matchId: match._id,
      message: `${match.team1} vs ${match.team2} has started!`
    });

    res.json({ message: 'Match started', status: 'live' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/simulation/complete/:matchId - Complete match with simulation
router.post('/complete/:matchId', adminAuth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId)
      .populate('team1Players team2Players');

    if (!match) return res.status(404).json({ error: 'Match not found' });

    const { performances, result } = simulateMatch(match.team1Players, match.team2Players);

    // Save performances and result
    match.performances = performances;
    match.result = {
      winner: result.winner === 'team1' ? match.team1 : match.team2,
      team1Score: result.team1Score,
      team2Score: result.team2Score,
      description: result.description.replace('Team 1', match.team1).replace('Team 2', match.team2)
    };
    match.status = 'completed';
    await match.save();

    // Calculate and update all fantasy team points
    const teams = await FantasyTeam.find({ match: match._id })
      .populate('players.player');

    let updatedTeams = [];
    for (const team of teams) {
      const points = calculateTeamPoints(team.players, performances);
      team.totalPoints = points;
      await team.save();
      updatedTeams.push({ teamId: team._id, userId: team.user, points });
    }

    // Rank teams
    updatedTeams.sort((a, b) => b.points - a.points);
    for (let i = 0; i < updatedTeams.length; i++) {
      await FantasyTeam.findByIdAndUpdate(updatedTeams[i].teamId, { rank: i + 1 });
    }

    // Get top performances for broadcast
    const topPerformers = performances
      .sort((a, b) => b.fantasyPoints - a.fantasyPoints)
      .slice(0, 5);

    // Broadcast completion
    global.broadcast(match._id.toString(), {
      type: 'MATCH_COMPLETED',
      matchId: match._id,
      result: match.result,
      topPerformers,
      leaderboardUpdated: true
    });

    res.json({
      message: 'Match completed',
      result: match.result,
      performances: performances.length,
      teamsUpdated: updatedTeams.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/simulation/live-update/:matchId - Send live score update
router.post('/live-update/:matchId', adminAuth, async (req, res) => {
  try {
    const { over, ball, runs, wicket, batsman, bowler, commentary } = req.body;

    global.broadcast(req.params.matchId, {
      type: 'LIVE_UPDATE',
      over, ball, runs, wicket, batsman, bowler, commentary,
      timestamp: new Date()
    });

    res.json({ message: 'Update broadcast' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
