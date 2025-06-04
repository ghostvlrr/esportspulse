import React, { useState, useEffect } from 'react';
import '../styles/News.css';
import { Container, Grid, Typography, Box, CircularProgress } from '@mui/material';
import { api } from '../services/api';
import NewsCard from '../components/NewsCard';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image: string;
  date: string;
  category: string;
  author: string;
  url_path?: string;
}

const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.get('/news');
        setNews(response.data);
        setLoading(false);
      } catch (err) {
        setError('Haberler yüklenirken bir hata oluştu');
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleImageLoad = (imageUrl: string) => {
    setLoadedImages(prev => new Set([...prev, imageUrl]));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/images/default-news.jpg';
    handleImageLoad('/images/default-news.jpg');
  };

  const filteredNews = news.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="news-container">
      <div className="news-header">
        <h1>E-Spor Haberleri</h1>
        <div className="category-filter">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="League of Legends">League of Legends</option>
            <option value="CS:GO">CS:GO</option>
            <option value="Valorant">Valorant</option>
            <option value="Dota 2">Dota 2</option>
          </select>
        </div>
      </div>

      <div className="news-grid">
        {filteredNews.map(item => (
          <article key={item.id} className="news-card">
            <div className="news-image">
              <img 
                src={loadedImages.has(item.image) ? item.image : '/images/default-news.jpg'}
                alt={item.title}
                onLoad={() => handleImageLoad(item.image)}
                onError={handleImageError}
                loading="lazy"
              />
              <span className="category">{item.category}</span>
            </div>
            <div className="news-content">
              <h2>{item.title}</h2>
              <p>{item.content}</p>
              <div className="news-meta">
                <span className="author">{item.author}</span>
                <span className="date">{new Date(item.date).toLocaleDateString('tr-TR')}</span>
              </div>
              {item.url_path && (
                <a 
                  href={item.url_path} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="read-more"
                >
                  Devamını Oku
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default News; 