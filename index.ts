import { Player, isSamePlayer } from './types/player';
import { Point, PointsData, points, advantage, Score, fifteen, thirty, forty, FortyData, Deuce, deuce, game } from './types/score';
import { none, Option, some, match as matchOpt } from 'fp-ts/Option';
import { pipe } from 'fp-ts/lib/function';

// -------- Tooling functions --------- //

export const playerToString = (player: Player) => {
  switch (player) {
    case 'PLAYER_ONE':
      return 'Player 1';
    case 'PLAYER_TWO':
      return 'Player 2';
  }
};
export const otherPlayer = (player: Player) => {
  switch (player) {
    case 'PLAYER_ONE':
      return 'PLAYER_TWO';
    case 'PLAYER_TWO':
      return 'PLAYER_ONE';
  }
};

// Exercice 1 :
export const pointToString = (point: Point): string => {
  switch (point.kind) {
    case 'LOVE':
      return 'Love';
    case 'FIFTEEN':
      return 'Fifteen';
    case 'THIRTY':
      return 'Thirty';
    default:
      throw new Error('Invalid point');
  }
};

export const scoreToString = (score: Score): string => {
  switch (score.kind) {
    case 'POINTS':
      return `Player 1: ${pointToString(score.pointsData.PLAYER_ONE)} - Player 2: ${pointToString(score.pointsData.PLAYER_TWO)}`;
    case 'FORTY':
      return `Player ${score.fortyData.player === 'PLAYER_ONE' ? 1 : 2} has Forty against Player ${score.fortyData.player === 'PLAYER_ONE' ? 2 : 1}`;
    case 'DEUCE':
      return 'Deuce';
    case 'ADVANTAGE':
      return `Player ${score.player === 'PLAYER_ONE' ? 1 : 2} has Advantage`;
    case 'GAME':
      return `Player ${score.player === 'PLAYER_ONE' ? 1 : 2} wins the game`;
    default:
      throw new Error('Invalid score');
  }
};

export const scoreWhenDeuce = (winner: Player): Score => advantage(winner);

export const scoreWhenAdvantage = (
  advantagedPlayed: Player,
  winner: Player
): Score => {
  if (isSamePlayer(advantagedPlayed, winner)) return game(winner);
  return deuce();
};

export const incrementPoint = (point: Point): Option<Point> => {
  switch (point.kind) {
    case 'LOVE':
      return some(fifteen());
    case 'FIFTEEN':
      return some(thirty());
    case 'THIRTY':
      return none;
  }
};

export const scoreWhenForty = (
  currentForty: FortyData,
  winner: Player
): Score => {
  if (isSamePlayer(currentForty.player, winner)) return game(winner);
  return pipe(
    incrementPoint(currentForty.otherPoint),
    matchOpt(
      () => deuce(),
      p => forty(currentForty.player, p) as Score
    )
  );
};

export const scoreWhenGame = (winner: Player): Score => game(winner);

// Exercice 2
// implements `scoreWhenPoint` function
// Tip: You can use pipe function from fp-ts to improve readability.
// See scoreWhenForty function above.
export const scoreWhenPoint = (current: PointsData, winner: Player): Score => {
  const winnerPoints = current[winner];
  const incrementedPoints = incrementPoint(winnerPoints);

  return pipe(
    incrementedPoints,
    matchOpt(
      () => forty(winner, current[otherPlayer(winner)]),
      newPoints => points({ ...current, [winner]: newPoints })
    )
  );
};

const score = (currentScore: Score, winner: Player): Score => {
  switch (currentScore.kind) {
    case 'POINTS':
      return scoreWhenPoint(currentScore.pointsData, winner);
    case 'FORTY':
      return scoreWhenForty(currentScore.fortyData, winner);
    case 'ADVANTAGE':
      return scoreWhenAdvantage(currentScore.player, winner);
    case 'DEUCE':
      return scoreWhenDeuce(winner);
    case 'GAME':
      return scoreWhenGame(winner);
  }
};
