import React, { useState, useRef, useEffect } from 'react';
import './ThemeSelector.css';
import { useTheme } from '../contexts/ThemeContext';

const THEMES = [
  {
    key: 'default',
    name: 'Kırmızı & Siyah',
    gradient: 'linear-gradient(135deg, #FF0000 0%, #171717 100%)',
  },
  {
    key: 'space',
    name: 'Mavi Gece',
    gradient: 'linear-gradient(135deg, #00F5FF 0%, #0A2233 100%)',
  },
  {
    key: 'sunset',
    name: 'Turuncu Günbatımı',
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)',
  },
  {
    key: 'neon',
    name: 'Neon Yeşil',
    gradient: 'linear-gradient(135deg, #00FF00 0%, #0A0A0A 100%)',
  },
  {
    key: 'ocean',
    name: 'Aqua Mavi',
    gradient: 'linear-gradient(135deg, #64FFDA 0%, #00B4D8 100%)',
  },
  {
    key: 'purple',
    name: 'Mor & Pembe',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  },
  {
    key: 'gold',
    name: 'Altın & Siyah',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #232526 100%)',
  },
];

const ThemeSelector: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { themeKey, changeTheme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleThemeChange = (themeKey: string) => {
    changeTheme(themeKey);
    setOpen(false);
  };

  return (
    <div className="theme-selector-root" ref={ref}>
      <button
        className="theme-selector-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Tema seçici"
      >
        <div
          className="theme-selector-preview"
          style={{ background: THEMES.find(t => t.key === themeKey)?.gradient }}
        />
        <span className="theme-selector-label">
          {THEMES.find(t => t.key === themeKey)?.name}
        </span>
        <span className={`theme-selector-arrow ${open ? 'open' : ''}`}>
          ▼
        </span>
      </button>

      {open && (
        <div className="theme-selector-dropdown" role="listbox">
          <div className="theme-selector-grid">
            {THEMES.map((theme) => (
              <button
                key={theme.key}
                className="theme-selector-item"
                onClick={() => handleThemeChange(theme.key)}
                role="option"
                aria-selected={themeKey === theme.key}
                style={{ background: theme.gradient }}
                title={theme.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector; 