const mongoose = require('mongoose');

const playerPerformanceSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  runs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  oversBowled: { type: Number, default: 0 },
  maidens: { type: Number, default: 0 },
  runsConceded: { type: Number, default: 0 },
  catches: { type: Number, default: 0 },
  stumpings: { type: Number, default: 0 },
  runouts: { type: Number, default: 0 },
  fantasyPoints: { type: Number, default: 0 }
});

const matchSchema = new mongoose.Schema({
  team1: { type: String, required: true },
  team2: { type: String, required: true },
  team1Logo: String,
  team2Logo: String,
  venue: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed'],
    default: 'upcoming'
  },
  team1Players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  team2Players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  result: {
    winner: String,
    team1Score: String,
    team2Score: String,
    description: String
  },
  performances: [playerPerformanceSchema],
  prizePool: { type: Number, default: 10000 },
  totalContests: { type: Number, default: 0 },
  totalParticipants: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', matchSchema);
