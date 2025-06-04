import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Tabs, Tab, CircularProgress } from '@mui/material';
import { api } from '../services/api';
import TeamStatsTable from '../components/TeamStatsTable';
import PlayerStatsTable from '../components/PlayerStatsTable';
import '../styles/Stats.css';

interface TeamStats {
  id: number;
  name: string;
  logo: string;
  game: string;
  wins: number;
  losses: number;
  winRate: number;
  kda: number;
  avgGameTime: string;
}

interface PlayerStats {
  id: number;
  name: string;
  team: string;
  game: string;
  role: string;
  kda: number;
  csPerMin: number;
  visionScore: number;
  winRate: number;
}

const Stats: React.FC = () => {
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string>('League of Legends');
  const [activeTab, setActiveTab] = useState<'teams' | 'players'>('teams');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [teamsResponse, playersResponse] = await Promise.all([
          api.get(`/stats/teams?game=${selectedGame}`),
          api.get(`/stats/players?game=${selectedGame}`)
        ]);
        
        setTeamStats(teamsResponse.data);
        setPlayerStats(playersResponse.data);
        setLoading(false);
      } catch (err) {
        setError('İstatistikler yüklenirken bir hata oluştu');
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedGame]);

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="stats-container">
      <div className="stats-header">
        <h1>İstatistikler</h1>
        <div className="stats-controls">
          <select 
            value={selectedGame} 
            onChange={(e) => setSelectedGame(e.target.value)}
          >
            <option value="League of Legends">League of Legends</option>
            <option value="CS:GO">CS:GO</option>
            <option value="Valorant">Valorant</option>
          </select>
          <div className="tab-buttons">
            <button 
              className={activeTab === 'teams' ? 'active' : ''} 
              onClick={() => setActiveTab('teams')}
            >
              Takımlar
            </button>
            <button 
              className={activeTab === 'players' ? 'active' : ''} 
              onClick={() => setActiveTab('players')}
            >
              Oyuncular
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'teams' ? (
        <div className="stats-table-container">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Takım</th>
                <th>Galibiyet</th>
                <th>Mağlubiyet</th>
                <th>Galibiyet %</th>
                <th>KDA</th>
                <th>Ort. Oyun Süresi</th>
              </tr>
            </thead>
            <tbody>
              {teamStats.map(team => (
                <tr key={team.id}>
                  <td className="team-cell">
                    <img src={team.logo} alt={team.name} />
                    <span>{team.name}</span>
                  </td>
                  <td>{team.wins}</td>
                  <td>{team.losses}</td>
                  <td>{team.winRate}%</td>
                  <td>{team.kda}</td>
                  <td>{team.avgGameTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="stats-table-container">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Oyuncu</th>
                <th>Takım</th>
                <th>Rol</th>
                <th>KDA</th>
                <th>CS/Dakika</th>
                <th>Vizyon Skoru</th>
                <th>Galibiyet %</th>
              </tr>
            </thead>
            <tbody>
              {playerStats.map(player => (
                <tr key={player.id}>
                  <td>{player.name}</td>
                  <td>{player.team}</td>
                  <td>{player.role}</td>
                  <td>{player.kda}</td>
                  <td>{player.csPerMin}</td>
                  <td>{player.visionScore}</td>
                  <td>{player.winRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Stats; 