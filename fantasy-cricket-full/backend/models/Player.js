const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  team: { type: String, required: true }, // IPL team (e.g., "MI", "CSK")
  role: {
    type: String,
    enum: ['batsman', 'bowler', 'all-rounder', 'wicket-keeper'],
    required: true
  },
  nationality: { type: String, default: 'Indian' },
  credits: { type: Number, required: true, min: 6, max: 12 }, // selection cost
  avatar: { type: String, default: '' },
  stats: {
    matches: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    catches: { type: Number, default: 0 },
    strikeRate: { type: Number, default: 0 },
    economy: { type: Number, default: 0 },
    fifties: { type: Number, default: 0 },
    hundreds: { type: Number, default: 0 },
  },
  isActive: { type: Boolean, default: true },
  basePoints: { type: Number, default: 0 } // pre-match predicted points
});

module.exports = mongoose.model('Player', playerSchema);
