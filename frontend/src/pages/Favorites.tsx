import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Tabs, Tab, CircularProgress } from '@mui/material';
import { api } from '../services/api';
import FavoriteItem from '../components/FavoriteItem';
import '../styles/Favorites.css';

interface FavoriteItem {
  id: number;
  type: 'team' | 'match' | 'news';
  title: string;
  image: string;
  game?: string;
  date?: string;
  status?: string;
}

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await api.get('/favorites');
        setFavorites(response.data);
        setLoading(false);
      } catch (err) {
        setError('Favoriler yüklenirken bir hata oluştu');
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const filteredFavorites = favorites.filter(item => 
    selectedType === 'all' || item.type === selectedType
  );

  const removeFavorite = async (id: number) => {
    try {
      await api.delete(`/favorites/${id}`);
      setFavorites(favorites.filter(item => item.id !== id));
    } catch (err) {
      setError('Favori kaldırılırken bir hata oluştu');
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h1>Favorilerim</h1>
        <div className="type-filter">
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">Tümü</option>
            <option value="team">Takımlar</option>
            <option value="match">Maçlar</option>
            <option value="news">Haberler</option>
          </select>
        </div>
      </div>

      <div className="favorites-grid">
        {filteredFavorites.map(item => (
          <div key={item.id} className="favorite-card">
            <div className="favorite-image">
              <img src={item.image} alt={item.title} />
              <button 
                className="remove-favorite"
                onClick={() => removeFavorite(item.id)}
                title="Favorilerden Kaldır"
              >
                ❌
              </button>
            </div>
            <div className="favorite-content">
              <h3>{item.title}</h3>
              {item.game && <span className="game">{item.game}</span>}
              {item.date && <span className="date">{new Date(item.date).toLocaleDateString('tr-TR')}</span>}
              {item.status && <span className="status">{item.status}</span>}
            </div>
          </div>
        ))}
      </div>

      {filteredFavorites.length === 0 && (
        <div className="no-favorites">
          Henüz favori eklenmemiş
        </div>
      )}
    </div>
  );
};

export default Favorites; 