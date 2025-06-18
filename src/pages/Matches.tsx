import React, { useState, useEffect } from 'react';
import { Match, NotificationSettings } from '../types/match';
import useMatchService from '../hooks/useMatchService';

const Matches: React.FC = () => {
  const { getMatches, loading: serviceLoading, error: serviceError } = useMatchService();
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getMatches();
        
        // Bildirim ayarlarını kontrol et ve varsayılan değerleri ayarla
        const matchesWithNotifications = data.map(match => {
          const key = `match_notifications_${match.id}`;
          const stored = localStorage.getItem(key);
          const defaultSettings: Required<NotificationSettings> = {
            enabled: true,
            beforeMatch: 15,
            matchStart: true,
            matchEnd: true,
            scoreUpdate: true
          };
          
          const notifications = stored ? JSON.parse(stored) : defaultSettings;
          
          return {
            ...match,
            notifications
          };
        });
        
        setMatches(matchesWithNotifications);
      } catch (err) {
        console.error('Maçlar yüklenirken hata:', err);
        setError('Maçlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatches();
  }, [getMatches]);

  if (loading || serviceLoading) {
    return <div>Yükleniyor...</div>;
  }

  if (error || serviceError) {
    return <div>Hata: {error || serviceError}</div>;
  }

  return (
    <div>
      <h1>Maçlar</h1>
      {matches.length === 0 ? (
        <p>Henüz maç bulunmuyor.</p>
      ) : (
        <div>
          {matches.map(match => (
            <div key={match.id}>
              <h3>{match.team1} vs {match.team2}</h3>
              <p>Tarih: {new Date(match.date).toLocaleString()}</p>
              <p>Turnuva: {match.tournament_name || 'Belirtilmemiş'}</p>
              <p>Durum: {match.status || 'Bilinmiyor'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches; 