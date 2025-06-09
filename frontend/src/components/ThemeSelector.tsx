import React, { useState, useRef, useEffect } from 'react';
import './ThemeSelector.css';

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
  const [selected, setSelected] = useState(localStorage.getItem('theme') || 'default');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    document.body.setAttribute('data-theme', selected);
    localStorage.setItem('theme', selected);
    window.dispatchEvent(new Event('themeChanged'));
  }, [selected]);

  return (
    <div className="theme-selector-root" ref={ref}>
      <button
        className="theme-selector-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Tema seçici"
        type="button"
      >
        <span className="theme-selector-preview" style={{ background: THEMES.find(t => t.key === selected)?.gradient }} />
        <span className="theme-selector-label">Tema</span>
        <svg className={`theme-selector-arrow${open ? ' open' : ''}`} width="20" height="20" viewBox="0 0 20 20">
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      </button>
      {open && (
        <div className="theme-selector-dropdown">
          <div className="theme-selector-grid">
            {THEMES.map((theme) => (
              <button
                key={theme.key}
                className={`theme-selector-item${selected === theme.key ? ' selected' : ''}`}
                onClick={() => { setSelected(theme.key); setOpen(false); }}
                type="button"
                aria-label={theme.name}
                tabIndex={0}
              >
                <span className="theme-selector-dot" style={{ background: theme.gradient }} />
                {selected === theme.key && (
                  <span className="theme-selector-check">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path d="M5 11l4 4 6-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
                <span className="theme-selector-name">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector; 