const express = require('express');
const router = express.Router();
const FantasyTeam = require('../models/FantasyTeam');
const Match = require('../models/Match');
const Player = require('../models/Player');
const { auth } = require('../middleware/auth');
const { calculateTeamPoints } = require('../utils/fantasyPoints');

// POST /api/teams - Create/update fantasy team
router.post('/', auth, async (req, res) => {
  try {
    const { matchId, players, teamName } = req.body;
    // players: [{ playerId, isCaptain, isViceCaptain }]

    if (!matchId || !players || players.length !== 11)
      return res.status(400).json({ error: 'Must select exactly 11 players' });

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ error: 'Match not found' });
    if (match.status !== 'upcoming')
      return res.status(400).json({ error: 'Match has already started or ended' });

    // Validate captain/VC
    const captains = players.filter(p => p.isCaptain);
    const vcs = players.filter(p => p.isViceCaptain);
    if (captains.length !== 1) return res.status(400).json({ error: 'Select exactly 1 captain' });
    if (vcs.length !== 1) return res.status(400).json({ error: 'Select exactly 1 vice-captain' });
    if (captains[0].playerId === vcs[0].playerId)
      return res.status(400).json({ error: 'Captain and vice-captain must be different' });

    // Load players and validate roles
    const playerIds = players.map(p => p.playerId);
    const playerDocs = await Player.find({ _id: { $in: playerIds } });

    if (playerDocs.length !== 11)
      return res.status(400).json({ error: 'Invalid players selected' });

    // Role constraints
    const roles = { 'wicket-keeper': 0, batsman: 0, 'all-rounder': 0, bowler: 0 };
    let totalCredits = 0;
    playerDocs.forEach(p => {
      roles[p.role]++;
      totalCredits += p.credits;
    });

    if (roles['wicket-keeper'] < 1 || roles['wicket-keeper'] > 4)
      return res.status(400).json({ error: 'Select 1-4 wicket-keepers' });
    if (roles['batsman'] < 3 || roles['batsman'] > 6)
      return res.status(400).json({ error: 'Select 3-6 batsmen' });
    if (roles['all-rounder'] < 1 || roles['all-rounder'] > 4)
      return res.status(400).json({ error: 'Select 1-4 all-rounders' });
    if (roles['bowler'] < 3 || roles['bowler'] > 6)
      return res.status(400).json({ error: 'Select 3-6 bowlers' });

    if (totalCredits > 100)
      return res.status(400).json({ error: `Total credits (${totalCredits}) exceed limit of 100` });

    // Team composition: max 7 from one IPL team
    const allMatchPlayerIds = [
      ...match.team1Players.map(id => id.toString()),
      ...match.team2Players.map(id => id.toString())
    ];

    const team1Count = playerDocs.filter(p =>
      match.team1Players.map(id => id.toString()).includes(p._id.toString())
    ).length;

    if (team1Count > 10 || (11 - team1Count) > 10)
      return res.status(400).json({ error: 'Cannot select more than 10 players from one team' });

    // Build team object
    const teamPlayers = players.map(p => ({
      player: p.playerId,
      isCaptain: p.isCaptain,
      isViceCaptain: p.isViceCaptain
    }));

    // Upsert
    const team = await FantasyTeam.findOneAndUpdate(
      { user: req.user._id, match: matchId },
      { players: teamPlayers, teamName: teamName || 'My Team', totalCredits },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await team.populate('players.player', 'name role team credits avatar');
    res.json({ team, message: 'Team saved successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/teams/my - Get current user's teams
router.get('/my', auth, async (req, res) => {
  try {
    const teams = await FantasyTeam.find({ user: req.user._id })
      .populate('match', 'team1 team2 scheduledAt status result')
      .populate('players.player', 'name role team credits avatar');
    res.json({ teams });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/teams/match/:matchId - Get user's team for a match
router.get('/match/:matchId', auth, async (req, res) => {
  try {
    const team = await FantasyTeam.findOne({
      user: req.user._id,
      match: req.params.matchId
    }).populate('players.player', 'name role team credits avatar stats');

    if (!team) return res.status(404).json({ error: 'No team found for this match' });
    res.json({ team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
