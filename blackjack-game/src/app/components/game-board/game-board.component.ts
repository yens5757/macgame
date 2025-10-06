import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GameService } from '../../services/game.service';
import { GameState } from '../../models/game-state.model';
import { CardComponent } from '../card/card.component';
import { HistoryComponent } from '../../pages/history/history.component';
import { AiAssistantService } from '../../services/ai-assistant.service';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, HistoryComponent], 
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss']
})
export class GameBoardComponent implements OnInit, OnDestroy {
  gameState: GameState = {
    phase: 'betting',
    dealerHand: [],
    playerHand: [],
    bet: 0,
    chips: 1000,
    result: null,
    message: 'Place your bet'
  };
  betAmount: number = 10;
  showHistory: boolean = false;
  private subscription?: Subscription;
  aiAdvice: string = '';
  showAiAdvice: boolean = false;

  constructor(
    private gameService: GameService,
    private aiAssistantService: AiAssistantService
  ) {}

  ngOnInit(): void {
    this.subscription = this.gameService.gameState$.subscribe(
      state => this.gameState = state
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  placeBet(): void {
    this.gameService.placeBet(this.betAmount);
  }

  hit(): void {
    this.gameService.hit();
  }

  stand(): void {
    this.gameService.stand();
  }

  newGame(): void {
    this.gameService.newGame();
  }

  addChips(): void {
    this.gameService.addChips(100);
  }

  getDealerTotal(): number {
    return this.gameService.calculateHandValue(this.gameState.dealerHand);
  }

  getPlayerTotal(): number {
    return this.gameService.calculateHandValue(this.gameState.playerHand);
  }

  setBetAmount(amount: number): void {
    this.betAmount = amount;
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
  }

  async getAiAdvice(): Promise<void> {
    if (this.gameState.phase !== 'playing') return;
    
    this.showAiAdvice = true;
    this.aiAdvice = 'Thinking...';
    
    const advice = await this.aiAssistantService.getAdvice(
      this.gameState.playerHand,
      this.gameState.dealerHand[0],
      this.getPlayerTotal()
    );
    
    this.aiAdvice = advice;
  }

  closeAiAdvice(): void {
    this.showAiAdvice = false;
  }
}