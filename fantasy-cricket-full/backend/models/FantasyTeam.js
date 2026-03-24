const mongoose = require('mongoose');

const fantasyTeamSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  teamName: { type: String, default: 'My Team' },
  players: [{
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    isCaptain: { type: Boolean, default: false },
    isViceCaptain: { type: Boolean, default: false }
  }],
  totalCredits: { type: Number, default: 0 }, // sum of player credits used
  totalPoints: { type: Number, default: 0 },  // calculated after match
  rank: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false }, // locked when match starts
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure one team per user per match
fantasyTeamSchema.index({ user: 1, match: 1 }, { unique: true });

fantasyTeamSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('FantasyTeam', fantasyTeamSchema);
