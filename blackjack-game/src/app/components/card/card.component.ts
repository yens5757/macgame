import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../../models/card.model';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input() card?: Card;
  @Input() faceDown: boolean = false;

  isRed(): boolean {
    if (!this.card) return false;
    return this.card.suit === '♥' || this.card.suit === '♦';
  }
}