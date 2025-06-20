import React, { useState, useEffect, useCallback } from 'react';
import '../styles/Teams.css';
import { api } from '../services/api';
import { Favorite, FavoriteBorder, NotificationsActive, NotificationsOff } from '@mui/icons-material';
import { CircularProgress, IconButton, Tooltip, Badge, Dialog, DialogTitle, DialogContent, DialogActions, Button, Switch, FormControlLabel, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';

interface NotificationSettings {
  enabled: boolean;
  matchStart: boolean;
  scoreUpdate: boolean;
  matchEnd: boolean;
  beforeMatch: number;
}

interface Team {
  id: string;
  name: string;
  logo: string;
  game: string;
  region: string;
  notificationSettings: NotificationSettings;
}

const beforeMatchOptions = [5, 10, 15, 30, 45, 60];

const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [favoriteTeams, setFavoriteTeams] = useState<string[]>(() => {
    const stored = localStorage.getItem('favoriteTeams');
    return stored ? JSON.parse(stored) : [];
  });
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [selectedTeam] = useState<Team | null>(null);
  const [tempSettings, setTempSettings] = useState<NotificationSettings>({
    enabled: true,
    matchStart: true,
    scoreUpdate: true,
    matchEnd: true,
    beforeMatch: 15
  });

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/teams', {
        params: {
          per_page: 500,
          game: selectedGame !== 'all' ? selectedGame : undefined,
          region: selectedRegion !== 'all' ? selectedRegion : undefined
        }
      });
      const { teams: newTeams } = response.data;
      setTeams(newTeams);
      setLoading(false);
    } catch (err) {
      setError('Takımlar yüklenirken bir hata oluştu');
      setLoading(false);
    }
  }, [selectedGame, selectedRegion]);

  useEffect(() => {
    fetchTeams();
  }, [selectedGame, selectedRegion, fetchTeams]);

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(search.toLowerCase()) &&
    (selectedGame === 'all' || team.game === selectedGame) &&
    (
      selectedRegion === 'all' ? true :
      selectedRegion === 'TR' ? (
        team.region?.toLowerCase() === 'tr' ||
        team.region?.toLowerCase() === 'türkiye' ||
        team.region?.toLowerCase() === 'turkey' ||
        team.region?.toLowerCase() === 'türk'
      ) : team.region === selectedRegion
    )
  );

  const toggleFavorite = (teamId: string) => {
    setFavoriteTeams(prev => {
      const newFavorites = prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId];
      localStorage.setItem('favoriteTeams', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const hasActiveNotifications = useCallback((teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.notificationSettings?.enabled || false;
  }, [teams]);

  const handleRegionChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedRegion(event.target.value as string);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const clearSearch = () => {
    setSearch('');
  };

  const handleNotificationSettings = async (team: Team) => {
    try {
      const newSettings = {
        ...team.notificationSettings,
        enabled: !hasActiveNotifications(team.id)
      };

      await api.post(`/api/notifications/settings`, {
        teamId: team.id,
        settings: newSettings
      });

      setTeams(prevTeams => 
        prevTeams.map(t => 
          t.id === team.id 
            ? { ...t, notificationSettings: newSettings }
            : t
        )
      );

      toast.success(
        hasActiveNotifications(team.id)
          ? 'Bildirimler devre dışı bırakıldı'
          : 'Bildirimler etkinleştirildi'
      );
    } catch (error) {
      toast.error('Bildirim ayarları güncellenirken bir hata oluştu');
    }
  };

  const isFavorite = (teamId: string) => favoriteTeams.includes(teamId);

  const getFlagUrl = (region: string) => {
    if (!region) return null;
    const key = region.trim().toUpperCase();
    const map: {[key: string]: string} = {
      'TR': 'tr', 'TURKEY': 'tr', 'TÜRKİYE': 'tr', 'TÜRK': 'tr',
      'EU': 'eu', 'NA': 'us', 'US': 'us', 'CN': 'cn', 'KR': 'kr',
      'JP': 'jp', 'BR': 'br', 'FR': 'fr', 'DE': 'de', 'ES': 'es',
      'RU': 'ru', 'VN': 'vn', 'TH': 'th', 'PT': 'pt', 'SG': 'sg',
      'ID': 'id', 'PH': 'ph', 'PL': 'pl', 'IT': 'it', 'CA': 'ca',
      'GB': 'gb', 'UK': 'gb', 'SE': 'se', 'FI': 'fi', 'NO': 'no',
      'DK': 'dk', 'NL': 'nl', 'AR': 'ar', 'MX': 'mx', 'CL': 'cl',
      'CO': 'co', 'AU': 'au', 'IN': 'in', 'TW': 'tw', 'MN': 'mn',
      'ZA': 'za', 'EG': 'eg', 'SA': 'sa', 'AE': 'ae', 'IL': 'il',
      'GR': 'gr', 'CZ': 'cz', 'SK': 'sk', 'HU': 'hu', 'RO': 'ro',
      'BG': 'bg', 'HR': 'hr', 'RS': 'rs', 'UA': 'ua', 'BY': 'by'
    };
    return map[key] || null;
  };

  if (loading) {
    return (
      <div className="loading">
        <CircularProgress color="primary" size={48} />
        <span>Takımlar yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="teams-container">
      <div className="teams-header">
        <h1>Takımlar</h1>
        <div className="filters">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Takım ara..."
              value={search}
              onChange={handleSearchChange}
              className="team-search"
            />
            <SearchIcon style={{ position: 'absolute', left: 8, color: 'rgba(255, 255, 255, 0.7)', fontSize: 20 }} />
            {search && (
              <IconButton size="small" onClick={clearSearch} style={{ position: 'absolute', right: 4, color: 'rgba(255, 255, 255, 0.7)' }}>
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
          </div>
          <select 
            value={selectedGame} 
            onChange={(e) => setSelectedGame(e.target.value)}
          >
            <option value="all">Tüm Oyunlar</option>
            <option value="League of Legends">League of Legends</option>
            <option value="CS:GO">CS:GO</option>
            <option value="Valorant">Valorant</option>
          </select>
          <select 
            value={selectedRegion} 
            onChange={handleRegionChange}
          >
            <option value="all">Tüm Bölgeler</option>
            <option value="TR">Türk</option>
            <option value="EU">Avrupa</option>
            <option value="NA">Kuzey Amerika</option>
            <option value="CN">Çin</option>
          </select>
        </div>
      </div>

      <div className="teams-grid">
        {filteredTeams.map(team => (
          <motion.div
            key={team.id}
            className="team-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <img src={team.logo || '/logos/default.png'} alt={team.name} className="team-logo" onError={e => { e.currentTarget.src = '/logos/default.png'; }} />
            <h3>{team.name}</h3>
            <div className="team-info">
              <span className="game">{team.game}</span>
              <span className="region">
                {getFlagUrl(team.region) ? (
                  <img src={`https://flagcdn.com/24x18/${getFlagUrl(team.region)}.png`} alt={team.region} style={{marginRight: 4, verticalAlign: 'middle', borderRadius: 2, boxShadow: '0 1px 2px rgba(0,0,0,0.08)'}} />
                ) : (
                  <span style={{marginRight: 4}}>🌐</span>
                )}
                {team.region}
              </span>
            </div>
            <div className="team-actions">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <IconButton
                  onClick={() => toggleFavorite(team.id)}
                  className={`favorite-btn${isFavorite(team.id) ? ' active' : ''}`}
                  aria-label={isFavorite(team.id) ? 'Favoriden çıkar' : 'Favoriye ekle'}
                >
                  <AnimatePresence mode="wait">
                    {isFavorite(team.id) ? (
                      <motion.div
                        key="filled"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <Favorite sx={{ color: '#e53935', fontSize: 32 }} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="outline"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <FavoriteBorder sx={{ fontSize: 32 }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </IconButton>
              </motion.div>
              <Tooltip title={hasActiveNotifications(team.id) ? "Bildirim Ayarları" : "Bildirimleri Etkinleştir"}>
                <IconButton
                  onClick={() => handleNotificationSettings(team)}
                  className="notification-btn"
                  size="small"
                >
                  <Badge
                    color="error"
                    variant="dot"
                    invisible={!hasActiveNotifications(team.id)}
                  >
                    {hasActiveNotifications(team.id) ? (
                      <NotificationsActive sx={{ color: '#4caf50' }} />
                    ) : (
                      <NotificationsOff sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    )}
                  </Badge>
                </IconButton>
              </Tooltip>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog
        open={notificationDialogOpen}
        onClose={() => setNotificationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedTeam?.name} - Bildirim Ayarları
        </DialogTitle>
        <DialogContent>
          <div className="notification-settings">
            <FormControlLabel
              control={
                <Switch
                  checked={tempSettings.enabled}
                  onChange={e => setTempSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                />
              }
              label="Bildirimleri Etkinleştir"
            />
            <FormControl fullWidth margin="normal" disabled={!tempSettings.enabled}>
              <InputLabel id="before-match-label">Maç Öncesi Bildirim Zamanı</InputLabel>
              <Select
                labelId="before-match-label"
                value={tempSettings.beforeMatch}
                label="Maç Öncesi Bildirim Zamanı"
                onChange={e => setTempSettings(prev => ({ ...prev, beforeMatch: Number(e.target.value) }))}
              >
                {beforeMatchOptions.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt} dakika önce</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={tempSettings.matchStart}
                  onChange={e => setTempSettings(prev => ({ ...prev, matchStart: e.target.checked }))}
                  disabled={!tempSettings.enabled}
                />
              }
              label="Maç Başlangıcında Bildir"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={tempSettings.matchEnd}
                  onChange={e => setTempSettings(prev => ({ ...prev, matchEnd: e.target.checked }))}
                  disabled={!tempSettings.enabled}
                />
              }
              label="Maç Sonunda Bildir"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={tempSettings.scoreUpdate}
                  onChange={e => setTempSettings(prev => ({ ...prev, scoreUpdate: e.target.checked }))}
                  disabled={!tempSettings.enabled}
                />
              }
              label="Skor Güncellemelerinde Bildir"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationDialogOpen(false)}>İptal</Button>
          <Button onClick={() => {
            // Implement the logic to save the new settings
          }} variant="contained" color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Teams; 