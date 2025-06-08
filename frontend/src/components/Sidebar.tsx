import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import '../styles/Sidebar.css';

interface FavoriteMatch {
  id: string;
  team1: string;
  team2: string;
  tournament?: string;
}

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  // Favori maçları anlık göstermek için state ve event
  const [favoriteMatches, setFavoriteMatches] = useState<FavoriteMatch[]>([]);

  // Favori maçları oku
  const updateFavorites = () => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    const parsed = favs.map((str: string, i: number) => {
      const parts = str.split('-');
      if (parts.length >= 3) {
        return {
          id: str + '-' + i,
          team1: parts[0],
          team2: parts[1],
          tournament: parts.slice(2).join('-'),
        };
      }
      return { id: str + '-' + i, team1: str, team2: '', tournament: '' };
    });
    setFavoriteMatches(parsed);
  };

  useEffect(() => {
    updateFavorites();
    // localStorage değişimini dinle (başka sekme/f5)
    window.addEventListener('storage', updateFavorites);
    // custom event ile anlık güncelleme
    window.addEventListener('favoritesChanged', updateFavorites as EventListener);
    return () => {
      window.removeEventListener('storage', updateFavorites);
      window.removeEventListener('favoritesChanged', updateFavorites as EventListener);
    };
  }, []);

  // Favori ekleme/çıkarma yapan kodlarda şunu ekleyin:
  // window.dispatchEvent(new Event('favoritesChanged'));

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleOverlayClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button className="hamburger-menu" onClick={toggleSidebar}>
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="logo">
          <h1>EsportsPulse</h1>
        </div>

        <nav>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={() => setIsOpen(false)}>
            Ana Sayfa
          </Link>
          {/* <Link to="/matches" className={location.pathname === '/matches' ? 'active' : ''} onClick={() => setIsOpen(false)}>
            Maçlar
          </Link> */}
          <Link to="/teams" className={location.pathname === '/teams' ? 'active' : ''} onClick={() => setIsOpen(false)}>
            Takımlar
          </Link>
          <Link to="/news" className={location.pathname === '/news' ? 'active' : ''} onClick={() => setIsOpen(false)}>
            Haberler
          </Link>
          <Link to="/notifications" className={location.pathname === '/notifications' ? 'active' : ''} onClick={() => setIsOpen(false)}>
            Bildirimler
          </Link>
          {user ? (
            <>
              <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''} onClick={() => setIsOpen(false)}>
                Profil
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Çıkış Yap
              </button>
            </>
          ) : null}
        </nav>
        {/* Favori Maçlar Bölümü */}
        <div className="favorites-section">
          <div className="favorites-header">Favori Maçlar</div>
          <div className="favorite-items">
            {favoriteMatches.length === 0 ? (
              <div className="no-favorites">Henüz favori maç yok</div>
            ) : (
              favoriteMatches.map((fav) => (
                <div className="favorite-item" key={fav.id}>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{fav.team1}</span>
                  <span className="vs">vs</span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{fav.team2}</span>
                  {fav.tournament && (
                    <span style={{ color: '#FF0000', fontWeight: 500, marginLeft: 6, fontSize: 12 }}>
                      ({fav.tournament})
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        <div className="footer">
          © 2025 ESPORTS PULSE
          <br />
          Tüm hakları saklıdır
        </div>
      </div>

      <div 
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} 
        onClick={handleOverlayClick}
      />
    </>
  );
};

export default Sidebar; 