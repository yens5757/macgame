import { Card } from './card.model';

export type GamePhase = 'betting' | 'playing' | 'dealer-turn' | 'game-over';
export type GameResult = 'win' | 'lose' | 'push' | null;

export interface GameState {
  phase: GamePhase;
  dealerHand: Card[];
  playerHand: Card[];
  bet: number;
  chips: number;
  result: GameResult;
  message: string;
}