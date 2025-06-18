import { Match, NotificationSettings } from '../types/match';

export class MatchService {
  private readonly baseUrl = 'http://localhost:3001/api';

  async getMatches(): Promise<Match[]> {
    try {
      const response = await fetch(`${this.baseUrl}/matches`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Çok fazla istek gönderildi. Lütfen bir süre bekleyin.');
        }
        throw new Error(`Maçlar alınamadı: ${response.statusText}`);
      }

      const data = await response.json();
      return this.validateMatches(data);
    } catch (error) {
      console.error('Maçlar alınırken hata:', error);
      throw error;
    }
  }

  async getMatchById(id: string): Promise<Match> {
    try {
      const response = await fetch(`${this.baseUrl}/matches/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Çok fazla istek gönderildi. Lütfen bir süre bekleyin.');
        }
        throw new Error(`Maç detayı alınamadı: ${response.statusText}`);
      }

      const data = await response.json();
      return this.validateMatch(data);
    } catch (error) {
      console.error('Maç detayı alınırken hata:', error);
      throw error;
    }
  }

  private validateMatch(match: any): Match {
    if (!match.id || !match.team1 || !match.team2 || !match.date) {
      throw new Error('Geçersiz maç verisi');
    }

    const notifications: Required<NotificationSettings> = {
      enabled: match.notifications?.enabled ?? false,
      beforeMatch: match.notifications?.beforeMatch ?? 15,
      matchStart: match.notifications?.matchStart ?? false,
      matchEnd: match.notifications?.matchEnd ?? false,
      scoreUpdate: match.notifications?.scoreUpdate ?? false
    };

    return {
      ...match,
      date: new Date(match.date),
      notifications
    };
  }

  private validateMatches(matches: any[]): Match[] {
    return matches.map(match => this.validateMatch(match));
  }
} 