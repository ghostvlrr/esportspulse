import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { 
  Menu as MenuIcon, 
  Close as CloseIcon, 
  Home as HomeIcon, 
  Groups as GroupsIcon, 
  Newspaper as NewspaperIcon, 
  Notifications as NotificationsIcon, 
  Person as PersonIcon, 
  Logout as LogoutIcon
} from '@mui/icons-material';
import '../styles/Sidebar.css';
import ThemeSelector from './ThemeSelector';

interface FavoriteMatch {
  id: string;
  team1: string;
  team2: string;
}

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const sidebarRef = useRef<HTMLDivElement>(null);

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

    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <button className="hamburger-menu" onClick={toggleSidebar}>
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>
      <div className={`sidebar ${isOpen ? 'open' : ''}`} ref={sidebarRef}>
        <div className="logo">
          <h1>ESPORTS PULSE</h1>
        </div>
        <nav>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={() => setIsOpen(false)}>
            <HomeIcon sx={{ mr: 1 }} /> Ana Sayfa
          </Link>
          <Link to="/teams" className={location.pathname === '/teams' ? 'active' : ''} onClick={() => setIsOpen(false)}>
            <GroupsIcon sx={{ mr: 1 }} /> Takımlar
          </Link>
          <Link to="/news" className={location.pathname === '/news' ? 'active' : ''} onClick={() => setIsOpen(false)}>
            <NewspaperIcon sx={{ mr: 1 }} /> Haberler
          </Link>
          <Link to="/notifications" className={location.pathname === '/notifications' || location.pathname === '/favorites' ? 'active' : ''} onClick={() => setIsOpen(false)}>
            <NotificationsIcon sx={{ mr: 1 }} /> Bildirimler
          </Link>
          <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''} onClick={() => setIsOpen(false)}>
            <PersonIcon sx={{ mr: 1 }} /> Profil
          </Link>
          {user && (
            <button className="logout-btn" onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} /> Çıkış Yap
            </button>
          )}
        </nav>
        <div className="favorites-section">
          <h3 className="favorites-header">Favori Maçlar</h3>
          <div className="favorite-items">
            {favoriteMatches.length > 0 ? (
              favoriteMatches.map((match) => (
                <div key={match.id} className="favorite-item">
                  <span>{match.team1}</span>
                  <span className="vs">vs</span>
                  <span>{match.team2}</span>
                </div>
              ))
            ) : (
              <div className="no-favorites">Henüz favori maç yok</div>
            )}
          </div>
        </div>
        <ThemeSelector />
      </div>
    </>
  );
};

export default Sidebar; 