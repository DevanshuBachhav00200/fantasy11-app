/**
 * Fantasy Points Calculation System
 * Based on Dream11 scoring rules for T20 Cricket
 */

const POINTS = {
  // Batting
  RUN: 1,
  BOUNDARY_BONUS: 1,       // per 4
  SIX_BONUS: 2,            // per 6
  HALF_CENTURY_BONUS: 8,
  CENTURY_BONUS: 16,
  DUCK_PENALTY: -2,        // batsman dismissed for 0
  THIRTY_BONUS: 4,

  // Strike Rate (min 10 balls)
  SR_ABOVE_170: 6,
  SR_150_TO_170: 4,
  SR_130_TO_150: 2,
  SR_60_TO_70: -2,
  SR_50_TO_60: -4,
  SR_BELOW_50: -6,

  // Bowling
  WICKET: 25,
  BONUS_LBW_BOWLED: 8,
  THREE_WICKET_HAUL: 4,
  FOUR_WICKET_HAUL: 8,
  FIVE_WICKET_HAUL: 16,
  MAIDEN_OVER: 12,

  // Economy Rate (min 2 overs)
  ER_BELOW_5: 6,
  ER_5_TO_6: 4,
  ER_6_TO_7: 2,
  ER_10_TO_11: -2,
  ER_11_TO_12: -4,
  ER_ABOVE_12: -6,

  // Fielding
  CATCH: 8,
  THREE_CATCH_BONUS: 4,
  STUMPING: 12,
  RUNOUT_DIRECT: 12,
  RUNOUT_INDIRECT: 6,

  // General
  PLAYING_XI: 4,

  // Multipliers
  CAPTAIN_MULTIPLIER: 2,
  VICE_CAPTAIN_MULTIPLIER: 1.5
};

function calculateFantasyPoints(performance) {
  let points = POINTS.PLAYING_XI; // base points for playing

  const { runs, balls, fours, sixes, wickets, oversBowled,
    maidens, runsConceded, catches, stumpings, runouts } = performance;

  // --- BATTING ---
  points += runs * POINTS.RUN;
  points += fours * POINTS.BOUNDARY_BONUS;
  points += sixes * POINTS.SIX_BONUS;

  if (runs >= 100) points += POINTS.CENTURY_BONUS;
  else if (runs >= 50) points += POINTS.HALF_CENTURY_BONUS;
  else if (runs >= 30) points += POINTS.THIRTY_BONUS;

  if (runs === 0 && balls > 0) points += POINTS.DUCK_PENALTY;

  // Strike Rate (min 10 balls faced)
  if (balls >= 10) {
    const sr = (runs / balls) * 100;
    if (sr > 170) points += POINTS.SR_ABOVE_170;
    else if (sr >= 150) points += POINTS.SR_150_TO_170;
    else if (sr >= 130) points += POINTS.SR_130_TO_150;
    else if (sr >= 60 && sr < 70) points += POINTS.SR_60_TO_70;
    else if (sr >= 50 && sr < 60) points += POINTS.SR_50_TO_60;
    else if (sr < 50) points += POINTS.SR_BELOW_50;
  }

  // --- BOWLING ---
  points += wickets * POINTS.WICKET;

  if (wickets >= 5) points += POINTS.FIVE_WICKET_HAUL;
  else if (wickets >= 4) points += POINTS.FOUR_WICKET_HAUL;
  else if (wickets >= 3) points += POINTS.THREE_WICKET_HAUL;

  points += maidens * POINTS.MAIDEN_OVER;

  // Economy Rate (min 2 overs)
  if (oversBowled >= 2) {
    const er = runsConceded / oversBowled;
    if (er < 5) points += POINTS.ER_BELOW_5;
    else if (er < 6) points += POINTS.ER_5_TO_6;
    else if (er < 7) points += POINTS.ER_6_TO_7;
    else if (er >= 10 && er < 11) points += POINTS.ER_10_TO_11;
    else if (er >= 11 && er < 12) points += POINTS.ER_11_TO_12;
    else if (er >= 12) points += POINTS.ER_ABOVE_12;
  }

  // --- FIELDING ---
  points += catches * POINTS.CATCH;
  if (catches >= 3) points += POINTS.THREE_CATCH_BONUS;
  points += stumpings * POINTS.STUMPING;
  points += runouts * POINTS.RUNOUT_DIRECT;

  return Math.max(0, points);
}

function applyRoleMultiplier(basePoints, isCaptain, isViceCaptain) {
  if (isCaptain) return basePoints * POINTS.CAPTAIN_MULTIPLIER;
  if (isViceCaptain) return basePoints * POINTS.VICE_CAPTAIN_MULTIPLIER;
  return basePoints;
}

function calculateTeamPoints(teamPlayers, performances) {
  let total = 0;
  const perfMap = {};
  performances.forEach(p => { perfMap[p.player.toString()] = p; });

  teamPlayers.forEach(({ player, isCaptain, isViceCaptain }) => {
    const playerId = player._id ? player._id.toString() : player.toString();
    const perf = perfMap[playerId];
    if (perf) {
      const base = calculateFantasyPoints(perf);
      total += applyRoleMultiplier(base, isCaptain, isViceCaptain);
    }
  });

  return Math.round(total * 10) / 10;
}

module.exports = { calculateFantasyPoints, calculateTeamPoints, applyRoleMultiplier, POINTS };
