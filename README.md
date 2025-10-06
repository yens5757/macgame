# Blackjack Game

A full-stack blackjack game built with Angular and Supabase.

**Developer:** Aiken Lee
**Email:** chikitlee2001@gmail.com  
**Deployed URL:** macgame2.vercel.app

## Features

Fully functional blackjack game with correct game logic
Chip balance and betting system (10, 25, 50, 100 quick bet buttons)
External database integration (Supabase) for persistent chip storage
Game history saved to database with all game details
Statistics page showing:
  - Total games played
  - Wins, losses, and pushes
  - Win rate percentage
  - Current chip balance
  - Recent games table
AI Assistant integration (Gemini API with basic strategy fallback)
Responsive mobile-friendly design
Dark theme UI with Bootstrap styling

## Tech Stack

- **Frontend:** Angular 20, TypeScript, Bootstrap 5, SCSS
- **Database:** Supabase (PostgreSQL)
- **AI:** Google Gemini API (with intelligent fallback)
- **Deployment:** Vercel
- **Version Control:** Git/GitHub

## Game Rules

- **Objective:** Get a hand total closer to 21 than the dealer without going over
- **Card Values:** 
  - Number cards (2-10): Face value
  - Face cards (J, Q, K): 10 points
  - Ace: 1 or 11 points (automatically optimized)
- **Dealer Rules:**
  - Must hit on 16 or less
  - Must stand on 17 or more
- **Payouts:**
  - Win: 2x your bet
  - Push (tie): Bet returned
  - Loss: Lose your bet
