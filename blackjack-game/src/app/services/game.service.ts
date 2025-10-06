import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Card, Rank, Suit } from '../models/card.model';
import { GameState, GamePhase, GameResult } from '../models/game-state.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly suits: Suit[] = ['♠', '♥', '♦', '♣'];
  private readonly ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  private gameState = new BehaviorSubject<GameState>({
    phase: 'betting',
    dealerHand: [],
    playerHand: [],
    bet: 0,
    chips: 1000,
    result: null,
    message: 'Place your bet'
  });

  public gameState$: Observable<GameState> = this.gameState.asObservable();

  constructor(private supabaseService: SupabaseService) {
    this.loadChipBalance();
  }

  private async loadChipBalance(): Promise<void> {
    const balance = await this.supabaseService.getChipBalance();
    this.updateState({ chips: balance });
  }

  // Generate a random card (infinite deck)
  private drawCard(): Card {
    const suit = this.suits[Math.floor(Math.random() * this.suits.length)];
    const rank = this.ranks[Math.floor(Math.random() * this.ranks.length)];
    
    let value: number;
    if (rank === 'A') {
      value = 11; // We'll handle Ace logic in calculateHandValue
    } else if (['J', 'Q', 'K'].includes(rank)) {
      value = 10;
    } else {
      value = parseInt(rank);
    }

    return { suit, rank, value };
  }

  // Calculate hand value (handle Aces)
  calculateHandValue(cards: Card[]): number {
    let total = 0;
    let aces = 0;

    cards.forEach(card => {
      if (card.rank === 'A') {
        aces++;
        total += 11;
      } else {
        total += card.value;
      }
    });

    // Adjust for Aces
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }

    return total;
  }

  // Place bet and deal initial cards
  placeBet(amount: number): void {
    const currentState = this.gameState.value;

    if (amount > currentState.chips) {
      this.updateState({ message: 'Insufficient chips!' });
      return;
    }

    if (amount <= 0) {
      this.updateState({ message: 'Bet must be greater than 0!' });
      return;
    }

    // Deal initial cards
    const playerHand = [this.drawCard(), this.drawCard()];
    const dealerHand = [this.drawCard()];

    this.updateState({
      phase: 'playing',
      bet: amount,
      chips: currentState.chips - amount,
      playerHand,
      dealerHand,
      result: null,
      message: 'Your turn - Hit or Stand?'
    });

    // Check for instant blackjack
    if (this.calculateHandValue(playerHand) === 21) {
      setTimeout(() => this.stand(), 500);
    }
  }

  // Player hits
  hit(): void {
    const currentState = this.gameState.value;
    
    if (currentState.phase !== 'playing') return;

    const newCard = this.drawCard();
    const playerHand = [...currentState.playerHand, newCard];
    const playerTotal = this.calculateHandValue(playerHand);

    this.updateState({ playerHand });

    // Check for bust
    if (playerTotal > 21) {
      this.endGame('lose', 'You busted!');
    }
  }

  // Player stands
  stand(): void {
    const currentState = this.gameState.value;
    
    if (currentState.phase !== 'playing') return;

    this.updateState({ 
      phase: 'dealer-turn',
      message: 'Dealer is playing...'
    });

    // Dealer plays after a short delay
    setTimeout(() => {
      this.dealerPlay();
    }, 1000);
  }

  // Dealer plays according to rules
  private dealerPlay(): void {
    const currentState = this.gameState.value;
    let dealerHand = [...currentState.dealerHand];

    const dealNextCard = () => {
      if (this.calculateHandValue(dealerHand) < 17) {
        dealerHand.push(this.drawCard());
        this.updateState({ dealerHand });
        setTimeout(dealNextCard, 800);
      } else {
        setTimeout(() => {
          this.determineWinner();
        }, 500);
      }
    };

    dealNextCard();
  }

  // Determine winner
  private determineWinner(): void {
    const currentState = this.gameState.value;
    const playerTotal = this.calculateHandValue(currentState.playerHand);
    const dealerTotal = this.calculateHandValue(currentState.dealerHand);

    let result: GameResult;
    let message: string;
    let payout = 0;

    if (dealerTotal > 21) {
      result = 'win';
      message = 'Dealer busted! You win!';
      payout = currentState.bet * 2;
    } else if (playerTotal > dealerTotal) {
      result = 'win';
      message = 'You win!';
      payout = currentState.bet * 2;
    } else if (playerTotal < dealerTotal) {
      result = 'lose';
      message = 'Dealer wins!';
      payout = 0;
    } else {
      result = 'push';
      message = 'Push - bet returned';
      payout = currentState.bet;
    }

    this.endGame(result, message, payout);
  }

  // End game
  private async endGame(result: GameResult, message: string, payout: number = 0): Promise<void> {
    const currentState = this.gameState.value;
    const newChipBalance = currentState.chips + payout;

    this.updateState({
      phase: 'game-over',
      result,
      message,
      chips: newChipBalance
    });

    // Save to database
    await this.supabaseService.updateChipBalance(newChipBalance);
    await this.supabaseService.saveGame({
      bet_amount: currentState.bet,
      player_hand: currentState.playerHand,
      dealer_hand: currentState.dealerHand,
      player_total: this.calculateHandValue(currentState.playerHand),
      dealer_total: this.calculateHandValue(currentState.dealerHand),
      result: result || 'unknown',
      payout: payout
    });
  }

  // Reset for new game
  newGame(): void {
    const currentState = this.gameState.value;
    
    this.updateState({
      phase: 'betting',
      dealerHand: [],
      playerHand: [],
      bet: 0,
      result: null,
      message: 'Place your bet'
    });
  }

  // Add chips
  addChips(amount: number): void {
    const currentState = this.gameState.value;
    this.updateState({
      chips: currentState.chips + amount
    });
  }

  // Helper to update state
  private updateState(partial: Partial<GameState>): void {
    this.gameState.next({
      ...this.gameState.value,
      ...partial
    });
  }

  // Get current state
  getCurrentState(): GameState {
    return this.gameState.value;
  }
}