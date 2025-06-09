import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { Menu as MenuIcon, Close as CloseIcon, Home as HomeIcon, Groups as GroupsIcon, Newspaper as NewspaperIcon, Notifications as NotificationsIcon, Person as PersonIcon, Logout as LogoutIcon } from '@mui/icons-material';
import '../styles/Sidebar.css';
import ThemeSelector from './ThemeSelector';

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

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <>
      <button className="hamburger-menu" onClick={toggleSidebar}>
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`} style={{ background: getComputedStyle(document.body).getPropertyValue('--color-sidebar'), transition: 'background 0.6s cubic-bezier(0.4,0,0.2,1)' }}>
        <div className="logo">
          <h1>EsportsPulse</h1>
        </div>

        <nav>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={() => setIsOpen(false)}>
            <HomeIcon sx={{ mr: 1 }} /> Ana Sayfa
          </Link>
          {/* <Link to="/matches" className={location.pathname === '/matches' ? 'active' : ''} onClick={() => setIsOpen(false)}>
            Maçlar
          </Link> */}
          <Link to="/teams" className={location.pathname === '/teams' ? 'active' : ''} onClick={() => setIsOpen(false)}>
            <GroupsIcon sx={{ mr: 1 }} /> Takımlar
          </Link>
          <Link to="/news" className={location.pathname === '/news' ? 'active' : ''} onClick={() => setIsOpen(false)}>
            <NewspaperIcon sx={{ mr: 1 }} /> Haberler
          </Link>
          <Link to="/notifications" className={location.pathname === '/notifications' ? 'active' : ''} onClick={() => setIsOpen(false)}>
            <NotificationsIcon sx={{ mr: 1 }} /> Bildirimler
          </Link>
          {user ? (
            <>
              <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''} onClick={() => setIsOpen(false)}>
                <PersonIcon sx={{ mr: 1 }} /> Profil
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                <LogoutIcon sx={{ mr: 1 }} /> Çıkış Yap
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
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '24px 0 12px 0', padding: '0 0 0 0' }}>
          <ThemeSelector />
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