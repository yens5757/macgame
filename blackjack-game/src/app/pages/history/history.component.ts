import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService, GameHistoryRecord, UserStats } from '../../services/supabase.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  gameHistory: GameHistoryRecord[] = [];
  userStats: UserStats | null = null;
  loading: boolean = true;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading = true;
    this.gameHistory = await this.supabaseService.getGameHistory(50);
    this.userStats = await this.supabaseService.getUserStats();
    this.loading = false;
  }

  getWinRate(): number {
    if (!this.userStats || this.userStats.total_games === 0) return 0;
    return (this.userStats.total_wins / this.userStats.total_games) * 100;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getResultClass(result: string): string {
    if (result === 'win') return 'table-success';
    if (result === 'lose') return 'table-danger';
    return 'table-warning';
  }
}