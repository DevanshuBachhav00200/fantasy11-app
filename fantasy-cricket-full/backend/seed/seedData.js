require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Player = require('../models/Player');
const Match = require('../models/Match');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fantasy_cricket';

const iplPlayers = [
  // Mumbai Indians (MI)
  { name: 'Rohit Sharma', team: 'MI', role: 'batsman', credits: 10.5, nationality: 'Indian', stats: { matches: 243, runs: 6628, wickets: 15, fifties: 42, hundreds: 1, strikeRate: 130.6 }, basePoints: 85 },
  { name: 'Ishan Kishan', team: 'MI', role: 'wicket-keeper', credits: 9.5, nationality: 'Indian', stats: { matches: 105, runs: 2644, catches: 62, stumpings: 12, strikeRate: 136.1 }, basePoints: 75 },
  { name: 'Suryakumar Yadav', team: 'MI', role: 'batsman', credits: 11.0, nationality: 'Indian', stats: { matches: 152, runs: 3921, fifties: 25, strikeRate: 147.3 }, basePoints: 95 },
  { name: 'Hardik Pandya', team: 'MI', role: 'all-rounder', credits: 11.0, nationality: 'Indian', stats: { matches: 140, runs: 2049, wickets: 73, strikeRate: 151.1, economy: 8.9 }, basePoints: 92 },
  { name: 'Jasprit Bumrah', team: 'MI', role: 'bowler', credits: 10.0, nationality: 'Indian', stats: { matches: 143, wickets: 185, economy: 7.4 }, basePoints: 88 },
  { name: 'Tilak Varma', team: 'MI', role: 'batsman', credits: 8.5, nationality: 'Indian', stats: { matches: 44, runs: 1016, strikeRate: 143.2 }, basePoints: 65 },
  { name: 'Tim David', team: 'MI', role: 'batsman', credits: 8.0, nationality: 'Singaporean', stats: { matches: 38, runs: 830, strikeRate: 162.8 }, basePoints: 60 },
  { name: 'Piyush Chawla', team: 'MI', role: 'bowler', credits: 7.5, nationality: 'Indian', stats: { matches: 192, wickets: 184, economy: 7.9 }, basePoints: 55 },
  { name: 'Arjun Tendulkar', team: 'MI', role: 'bowler', credits: 7.0, nationality: 'Indian', stats: { matches: 8, wickets: 4, economy: 9.2 }, basePoints: 40 },
  { name: 'Dewald Brevis', team: 'MI', role: 'batsman', credits: 8.0, nationality: 'South African', stats: { matches: 20, runs: 425, strikeRate: 155.1 }, basePoints: 58 },
  { name: 'Kumar Kartikeya', team: 'MI', role: 'bowler', credits: 7.5, nationality: 'Indian', stats: { matches: 22, wickets: 22, economy: 8.1 }, basePoints: 50 },

  // Chennai Super Kings (CSK)
  { name: 'MS Dhoni', team: 'CSK', role: 'wicket-keeper', credits: 10.0, nationality: 'Indian', stats: { matches: 250, runs: 5082, catches: 148, stumpings: 42, strikeRate: 135.2 }, basePoints: 82 },
  { name: 'Ruturaj Gaikwad', team: 'CSK', role: 'batsman', credits: 10.0, nationality: 'Indian', stats: { matches: 74, runs: 2389, fifties: 18, hundreds: 2, strikeRate: 136.4 }, basePoints: 80 },
  { name: 'Devon Conway', team: 'CSK', role: 'batsman', credits: 9.5, nationality: 'New Zealander', stats: { matches: 38, runs: 1148, fifties: 10, strikeRate: 133.7 }, basePoints: 72 },
  { name: 'Ravindra Jadeja', team: 'CSK', role: 'all-rounder', credits: 10.5, nationality: 'Indian', stats: { matches: 226, runs: 2692, wickets: 152, economy: 7.6 }, basePoints: 88 },
  { name: 'Deepak Chahar', team: 'CSK', role: 'bowler', credits: 8.5, nationality: 'Indian', stats: { matches: 94, wickets: 83, economy: 8.0 }, basePoints: 65 },
  { name: 'Shivam Dube', team: 'CSK', role: 'all-rounder', credits: 8.5, nationality: 'Indian', stats: { matches: 80, runs: 1320, wickets: 38, strikeRate: 157.6 }, basePoints: 68 },
  { name: 'Moeen Ali', team: 'CSK', role: 'all-rounder', credits: 9.0, nationality: 'English', stats: { matches: 77, runs: 1227, wickets: 55, economy: 7.5 }, basePoints: 70 },
  { name: 'Tushar Deshpande', team: 'CSK', role: 'bowler', credits: 8.0, nationality: 'Indian', stats: { matches: 35, wickets: 42, economy: 9.8 }, basePoints: 58 },
  { name: 'Matheesha Pathirana', team: 'CSK', role: 'bowler', credits: 8.5, nationality: 'Sri Lankan', stats: { matches: 22, wickets: 32, economy: 8.5 }, basePoints: 68 },
  { name: 'Ben Stokes', team: 'CSK', role: 'all-rounder', credits: 9.5, nationality: 'English', stats: { matches: 43, runs: 920, wickets: 28, strikeRate: 145.2 }, basePoints: 75 },
  { name: 'Rachin Ravindra', team: 'CSK', role: 'all-rounder', credits: 8.0, nationality: 'New Zealander', stats: { matches: 15, runs: 388, wickets: 12 }, basePoints: 55 },

  // Royal Challengers Bangalore (RCB)
  { name: 'Virat Kohli', team: 'RCB', role: 'batsman', credits: 12.0, nationality: 'Indian', stats: { matches: 243, runs: 7624, fifties: 50, hundreds: 7, strikeRate: 130.0 }, basePoints: 98 },
  { name: 'Faf du Plessis', team: 'RCB', role: 'batsman', credits: 10.0, nationality: 'South African', stats: { matches: 143, runs: 3980, fifties: 32, hundreds: 2, strikeRate: 134.6 }, basePoints: 80 },
  { name: 'Glenn Maxwell', team: 'RCB', role: 'all-rounder', credits: 10.5, nationality: 'Australian', stats: { matches: 113, runs: 2771, wickets: 38, strikeRate: 154.8 }, basePoints: 88 },
  { name: 'Mohammed Siraj', team: 'RCB', role: 'bowler', credits: 8.5, nationality: 'Indian', stats: { matches: 101, wickets: 101, economy: 8.6 }, basePoints: 65 },
  { name: 'Dinesh Karthik', team: 'RCB', role: 'wicket-keeper', credits: 8.5, nationality: 'Indian', stats: { matches: 257, runs: 4843, catches: 118, stumpings: 28, strikeRate: 142.7 }, basePoints: 62 },
  { name: 'Harshal Patel', team: 'RCB', role: 'bowler', credits: 9.0, nationality: 'Indian', stats: { matches: 85, wickets: 106, economy: 8.8 }, basePoints: 72 },
  { name: 'Anuj Rawat', team: 'RCB', role: 'wicket-keeper', credits: 7.5, nationality: 'Indian', stats: { matches: 28, runs: 462, catches: 18 }, basePoints: 45 },
  { name: 'Reece Topley', team: 'RCB', role: 'bowler', credits: 8.0, nationality: 'English', stats: { matches: 15, wickets: 17, economy: 8.4 }, basePoints: 52 },
  { name: 'Mahipal Lomror', team: 'RCB', role: 'all-rounder', credits: 7.5, nationality: 'Indian', stats: { matches: 30, runs: 386, wickets: 8 }, basePoints: 45 },
  { name: 'Finn Allen', team: 'RCB', role: 'batsman', credits: 8.5, nationality: 'New Zealander', stats: { matches: 25, runs: 642, strikeRate: 165.5 }, basePoints: 62 },
  { name: 'Tom Curran', team: 'RCB', role: 'all-rounder', credits: 7.5, nationality: 'English', stats: { matches: 20, wickets: 18, runs: 228 }, basePoints: 48 },

  // Kolkata Knight Riders (KKR)
  { name: 'Shreyas Iyer', team: 'KKR', role: 'batsman', credits: 10.5, nationality: 'Indian', stats: { matches: 119, runs: 3262, fifties: 20, strikeRate: 130.5 }, basePoints: 85 },
  { name: 'Venkatesh Iyer', team: 'KKR', role: 'all-rounder', credits: 9.0, nationality: 'Indian', stats: { matches: 55, runs: 1213, wickets: 12, strikeRate: 144.8 }, basePoints: 72 },
  { name: 'Rinku Singh', team: 'KKR', role: 'batsman', credits: 8.5, nationality: 'Indian', stats: { matches: 50, runs: 1065, strikeRate: 157.4 }, basePoints: 68 },
  { name: 'Andre Russell', team: 'KKR', role: 'all-rounder', credits: 10.5, nationality: 'West Indian', stats: { matches: 117, runs: 2217, wickets: 95, strikeRate: 178.5 }, basePoints: 90 },
  { name: 'Sunil Narine', team: 'KKR', role: 'all-rounder', credits: 10.0, nationality: 'West Indian', stats: { matches: 178, runs: 1354, wickets: 185, economy: 6.7 }, basePoints: 88 },
  { name: 'Nitish Rana', team: 'KKR', role: 'all-rounder', credits: 8.5, nationality: 'Indian', stats: { matches: 100, runs: 2264, wickets: 11, strikeRate: 136.8 }, basePoints: 68 },
  { name: 'Tim Southee', team: 'KKR', role: 'bowler', credits: 8.5, nationality: 'New Zealander', stats: { matches: 31, wickets: 37, economy: 8.4 }, basePoints: 62 },
  { name: 'Varun Chakravarthy', team: 'KKR', role: 'bowler', credits: 9.0, nationality: 'Indian', stats: { matches: 63, wickets: 79, economy: 7.1 }, basePoints: 72 },
  { name: 'Phil Salt', team: 'KKR', role: 'wicket-keeper', credits: 9.0, nationality: 'English', stats: { matches: 22, runs: 598, strikeRate: 158.1 }, basePoints: 70 },
  { name: 'Angkrish Raghuvanshi', team: 'KKR', role: 'batsman', credits: 7.5, nationality: 'Indian', stats: { matches: 10, runs: 225, strikeRate: 148.0 }, basePoints: 48 },
  { name: 'Harshit Rana', team: 'KKR', role: 'bowler', credits: 7.5, nationality: 'Indian', stats: { matches: 14, wickets: 18, economy: 9.1 }, basePoints: 50 },
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Player.deleteMany({}),
      Match.deleteMany({}),
      User.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Insert players
    const players = await Player.insertMany(iplPlayers);
    console.log(`Inserted ${players.length} players`);

    const getPlayersByTeam = (team) => players.filter(p => p.team === team);

    // Create matches
    const matches = await Match.create([
      {
        team1: 'MI',
        team2: 'CSK',
        venue: 'Wankhede Stadium, Mumbai',
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hrs from now
        status: 'upcoming',
        team1Players: getPlayersByTeam('MI').map(p => p._id),
        team2Players: getPlayersByTeam('CSK').map(p => p._id),
        prizePool: 50000
      },
      {
        team1: 'RCB',
        team2: 'KKR',
        venue: 'M. Chinnaswamy Stadium, Bangalore',
        scheduledAt: new Date(Date.now() + 26 * 60 * 60 * 1000), // tomorrow
        status: 'upcoming',
        team1Players: getPlayersByTeam('RCB').map(p => p._id),
        team2Players: getPlayersByTeam('KKR').map(p => p._id),
        prizePool: 75000
      },
      {
        team1: 'MI',
        team2: 'RCB',
        venue: 'Wankhede Stadium, Mumbai',
        scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        status: 'completed',
        team1Players: getPlayersByTeam('MI').map(p => p._id),
        team2Players: getPlayersByTeam('RCB').map(p => p._id),
        result: {
          winner: 'MI',
          team1Score: '197/5 (20 Overs)',
          team2Score: '183/8 (20 Overs)',
          description: 'MI won by 14 runs'
        },
        prizePool: 50000
      }
    ]);
    console.log(`Created ${matches.length} matches`);

    // Create admin user
    const admin = new User({
      username: 'admin',
      email: 'admin@fantasycricket.com',
      password: 'admin123',
      isAdmin: true,
      coins: 99999
    });
    await admin.save();

    // Create demo users
    const demoUsers = await User.create([
      { username: 'virat_fan', email: 'virat@demo.com', password: 'demo123', coins: 2500 },
      { username: 'dhoni_fan', email: 'dhoni@demo.com', password: 'demo123', coins: 1800 },
      { username: 'cricket_king', email: 'ck@demo.com', password: 'demo123', coins: 3200 }
    ]);

    console.log(`Created ${demoUsers.length + 1} users`);
    console.log('\n✅ Database seeded successfully!');
    console.log('\nDemo Credentials:');
    console.log('Admin: admin@fantasycricket.com / admin123');
    console.log('User: virat@demo.com / demo123');
    console.log(`\nMatch IDs:`);
    matches.forEach(m => console.log(`  ${m.team1} vs ${m.team2}: ${m._id}`));

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seedDatabase();
