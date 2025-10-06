import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Card } from '../models/card.model';

export interface GameHistoryRecord {
  id?: string;
  bet_amount: number;
  player_hand: Card[];
  dealer_hand: Card[];
  player_total: number;
  dealer_total: number;
  result: string;
  payout: number;
  created_at?: string;
}

export interface UserStats {
  id?: string;
  chip_balance: number;
  total_games: number;
  total_wins: number;
  total_losses: number;
  total_pushes: number;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private userStatsId: string = '';

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
    this.initializeUserStats();
  }

  // Initialize user stats (get or create)
  private async initializeUserStats(): Promise<void> {
    const { data, error } = await this.supabase
      .from('user_stats')
      .select('*')
      .limit(1)
      .single();

    if (data) {
      this.userStatsId = data.id;
    }
  }

  // Get user chip balance
  async getChipBalance(): Promise<number> {
    const { data, error } = await this.supabase
      .from('user_stats')
      .select('chip_balance')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching chip balance:', error);
      return 1000; // Default
    }

    return data?.chip_balance || 1000;
  }

  // Update chip balance
  async updateChipBalance(newBalance: number): Promise<void> {
    const { error } = await this.supabase
      .from('user_stats')
      .update({ chip_balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', this.userStatsId);

    if (error) {
      console.error('Error updating chip balance:', error);
    }
  }

  // Save game to history
  async saveGame(gameRecord: GameHistoryRecord): Promise<void> {
    const { error } = await this.supabase
      .from('game_history')
      .insert([gameRecord]);

    if (error) {
      console.error('Error saving game:', error);
      return;
    }

    // Update user stats
    await this.updateStats(gameRecord.result);
  }

  // Update user statistics
  private async updateStats(result: string): Promise<void> {
    const { data } = await this.supabase
      .from('user_stats')
      .select('*')
      .limit(1)
      .single();

    if (!data) return;

    const updates: Partial<UserStats> = {
      total_games: (data.total_games || 0) + 1,
      total_wins: data.total_wins || 0,
      total_losses: data.total_losses || 0,
      total_pushes: data.total_pushes || 0
    };

    if (result === 'win') updates.total_wins! += 1;
    else if (result === 'lose') updates.total_losses! += 1;
    else if (result === 'push') updates.total_pushes! += 1;

    await this.supabase
      .from('user_stats')
      .update(updates)
      .eq('id', data.id);
  }

  // Get game history
  async getGameHistory(limit: number = 20): Promise<GameHistoryRecord[]> {
    const { data, error } = await this.supabase
      .from('game_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching game history:', error);
      return [];
    }

    return data || [];
  }

  // Get user statistics
  async getUserStats(): Promise<UserStats | null> {
    const { data, error } = await this.supabase
      .from('user_stats')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }

    return data;
  }
}