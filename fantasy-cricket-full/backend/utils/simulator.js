/**
 * IPL Match Simulator
 * Generates realistic random performances for players
 */

const { calculateFantasyPoints } = require('./fantasyPoints');

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function weightedRandom(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

function simulateBatsman(role) {
  const isBatsman = role === 'batsman' || role === 'wicket-keeper';
  const isAllRounder = role === 'all-rounder';

  // Base run distribution
  const runRanges = isBatsman
    ? [[0, 10], [10, 30], [30, 60], [60, 100], [100, 150]]
    : isAllRounder
    ? [[0, 10], [10, 25], [25, 50], [50, 80], [80, 120]]
    : [[0, 5], [5, 15], [15, 30], [30, 50], [50, 70]];

  const weights = isBatsman ? [10, 25, 30, 25, 10] : isAllRounder ? [15, 30, 30, 20, 5] : [30, 35, 20, 10, 5];
  const rangeIdx = weightedRandom(weights);
  const range = runRanges[rangeIdx];
  const runs = randomBetween(range[0], range[1]);

  // Balls based on runs (approx strike rate 120-170)
  const strikeRate = randomBetween(100, 180);
  const balls = Math.max(1, Math.floor((runs / strikeRate) * 100));

  const fours = Math.floor(runs * randomBetween(5, 20) / 100);
  const sixes = Math.floor(runs * randomBetween(0, 15) / 100);

  return { runs, balls, fours, sixes };
}

function simulateBowler(role) {
  const isBowler = role === 'bowler';
  const isAllRounder = role === 'all-rounder';

  if (!isBowler && !isAllRounder) {
    return { wickets: 0, oversBowled: 0, runsConceded: 0, maidens: 0 };
  }

  const maxOvers = isBowler ? 4 : randomBetween(1, 4);
  const oversBowled = randomBetween(Math.max(1, maxOvers - 1), maxOvers);

  const wicketWeights = [40, 30, 18, 8, 3, 1]; // 0-5 wickets
  const wickets = weightedRandom(wicketWeights);

  const economy = randomBetween(55, 120) / 10; // 5.5 to 12
  const runsConceded = Math.floor(economy * oversBowled);
  const maidens = economy < 6 && oversBowled >= 2 ? randomBetween(0, 1) : 0;

  return { wickets, oversBowled, runsConceded, maidens };
}

function simulateFielding(role) {
  const catchProb = role === 'wicket-keeper' ? 0.6 : 0.25;
  const catches = Math.random() < catchProb ? randomBetween(0, role === 'wicket-keeper' ? 3 : 2) : 0;
  const stumpings = role === 'wicket-keeper' && Math.random() < 0.2 ? 1 : 0;
  const runouts = Math.random() < 0.1 ? 1 : 0;

  return { catches, stumpings, runouts };
}

function simulatePlayerPerformance(player) {
  const batting = simulateBatsman(player.role);
  const bowling = simulateBowler(player.role);
  const fielding = simulateFielding(player.role);

  const performance = {
    player: player._id,
    ...batting,
    ...bowling,
    ...fielding,
  };

  performance.fantasyPoints = calculateFantasyPoints(performance);
  return performance;
}

function simulateMatch(team1Players, team2Players) {
  const performances = [];

  [...team1Players, ...team2Players].forEach(player => {
    performances.push(simulatePlayerPerformance(player));
  });

  // Generate match scores
  const team1Runs = randomBetween(140, 220);
  const team1Wickets = randomBetween(3, 10);
  const team2Runs = randomBetween(130, 215);
  const team2Wickets = randomBetween(3, 10);

  const team1Score = `${team1Runs}/${team1Wickets} (20 Overs)`;
  const team2Score = `${team2Runs}/${team2Wickets} (20 Overs)`;
  const winner = team1Runs > team2Runs ? 'team1' : 'team2';
  const margin = Math.abs(team1Runs - team2Runs);

  return {
    performances,
    result: {
      winner,
      team1Score,
      team2Score,
      description: `${winner === 'team1' ? 'Team 1' : 'Team 2'} won by ${margin} runs`
    }
  };
}

module.exports = { simulateMatch, simulatePlayerPerformance };
