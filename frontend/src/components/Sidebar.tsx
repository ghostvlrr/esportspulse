import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="logo">
        ESPORTS PULSE
        <div style={{ fontSize: '0.8rem', color: 'rgb(176, 184, 209)' }}>
          E-Spor Dünyasının Nabzı
        </div>
      </div>
      <nav>
        <a className={location.pathname === '/' ? 'active' : ''} href="/">
          Maçlar
        </a>
        <a className={location.pathname === '/teams' ? 'active' : ''} href="/teams">
          Takımlar
        </a>
        <a className={location.pathname === '/news' ? 'active' : ''} href="/news">
          Haberler
        </a>
        <a className={location.pathname === '/stats' ? 'active' : ''} href="/stats">
          İstatistikler
        </a>
        <a className={location.pathname === '/notifications' ? 'active' : ''} href="/notifications">
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Bildirimler
            <span className="notification-badge">🔔 1</span>
          </span>
        </a>
      </nav>
      <div className="footer">
        © 2025 ESPORTS PULSE
        <br />
        Tüm hakları saklıdır
      </div>
    </aside>
  );
};

export default Sidebar; 