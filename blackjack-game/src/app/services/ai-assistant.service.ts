import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Card } from '../models/card.model';

@Injectable({
  providedIn: 'root'
})
export class AiAssistantService {
  
  // Using the current, stable model
  private readonly GEMINI_MODEL = 'gemini-2.5-flash'; 
  
  // Correct REST API path
  private readonly BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${this.GEMINI_MODEL}:generateContent`;

  constructor(private http: HttpClient) {}

  async getAdvice(playerHand: Card[], dealerCard: Card, playerTotal: number): Promise<string> {
    const prompt = `You are a blackjack strategy advisor. Player has ${playerTotal} total. Dealer shows ${dealerCard.rank}${dealerCard.suit}. Should player HIT or STAND? Give brief advice in 1-2 sentences.`;

    // 1. Prepare the simplest valid request body (removed optional config)
    const body = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    // 2. Prepare query parameters (API key)
    const params = { 
        key: environment.geminiApiKey 
    };

    try {
      // 3. Make the POST request
      const response: any = await firstValueFrom(
        this.http.post(this.BASE_URL, body, { params }) 
      );
      
      // 4. Safely extract the text
      const advice = response.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (advice) {
        return advice.trim();
      }
      
      // Fallback if the API returns a malformed response but no error
      return this.getBasicStrategy(playerTotal, dealerCard.value);
      
    } catch (error: any) {
      // 5. Robust error logging and fallback
      console.error('Gemini API Error - Request Failed.', error);
      if (error.status === 400 && error.error?.error?.message) {
         // Log the specific message returned by the Gemini API (if available)
         console.error('Gemini Error Message:', error.error.error.message);
      }
      return this.getBasicStrategy(playerTotal, dealerCard.value);
    }
  }

  private getBasicStrategy(playerTotal: number, dealerValue: number): string {
    if (playerTotal >= 17) {
      return "STAND - You have 17 or higher. Basic strategy says to stand.";
    }
    
    if (playerTotal <= 11) {
      return "HIT - You have 11 or less. You cannot bust, so always hit.";
    }
    
    if (playerTotal >= 13 && playerTotal <= 16) {
      if (dealerValue >= 7) {
        return `HIT - Dealer shows strong card (${dealerValue}). Hit with ${playerTotal}.`;
      } else {
        return `STAND - Dealer shows weak card (${dealerValue}). Stand and let dealer bust.`;
      }
    }
    
    if (playerTotal === 12) {
      if (dealerValue >= 4 && dealerValue <= 6) {
        return "STAND - Dealer has weak card (4-6). Let them bust.";
      } else {
        return "HIT - Dealer has strong card. Take another card.";
      }
    }
    
    return "HIT - Take another card to improve your hand.";
  }
}