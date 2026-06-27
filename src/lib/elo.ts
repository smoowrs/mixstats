export function calculateElo(
  teamAElo: number[],
  teamBElo: number[],
  scoreA: number,
  scoreB: number
) {
  const avgA = teamAElo.reduce((a, b) => a + b, 0) / Math.max(teamAElo.length, 1);
  const avgB = teamBElo.reduce((a, b) => a + b, 0) / Math.max(teamBElo.length, 1);

  const expectedA = 1 / (1 + Math.pow(10, (avgB - avgA) / 400));
  const expectedB = 1 / (1 + Math.pow(10, (avgA - avgB) / 400));

  let actualA = 0.5;
  let actualB = 0.5;
  
  if (scoreA > scoreB) {
    actualA = 1;
    actualB = 0;
  } else if (scoreA < scoreB) {
    actualA = 0;
    actualB = 1;
  }

  // K-factor determines how volatile the ratings are.
  const K = 32;
  
  // Also weight it slightly by score difference for more accuracy in FPS games
  const scoreDiff = Math.abs(scoreA - scoreB);
  const scoreMultiplier = Math.log(scoreDiff + 1) * 0.8 + 1; // gentle multiplier based on round diff

  const ratingChangeA = Math.round(K * (actualA - expectedA) * scoreMultiplier);
  const ratingChangeB = Math.round(K * (actualB - expectedB) * scoreMultiplier);

  return { ratingChangeA, ratingChangeB };
}
