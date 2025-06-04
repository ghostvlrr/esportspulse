import React, { useState, useEffect, useCallback } from 'react';
import '../styles/Teams.css';
import axios from 'axios';
import { Favorite, FavoriteBorder, Notifications, NotificationsActive, NotificationsOff } from '@mui/icons-material';
import { CircularProgress, IconButton, Tooltip, Badge, Dialog, DialogTitle, DialogContent, DialogActions, Button, Switch, FormControlLabel, TextField, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store/slices/notificationSlice';

interface Team {
  id: number;
  name: string;
  logo: string;
  game: string;
  region: string;
}

interface NotificationSettings {
  enabled: boolean;
  matchStart: boolean;
  scoreChange: boolean;
  matchEnd: boolean;
  beforeMatch: number;
}

const beforeMatchOptions = [5, 10, 15, 30, 45, 60];

const notificationMessages = {
  matchStart: (team: string) => `Hey! ${team} takımının maçı başlamak üzere, başarılar dileriz! 🏆`,
  scoreChange: (team: string) => `Skor değişti! ${team} mücadeleye devam ediyor, heyecan dorukta! ⚡`,
  matchEnd: (team: string) => `${team} takımının maçı sona erdi. Harika bir mücadeleydi! 👏`
};

const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [favoriteTeams, setFavoriteTeams] = useState<number[]>(() => {
    const stored = localStorage.getItem('favoriteTeams');
    return stored ? JSON.parse(stored) : [];
  });
  const [notificationSettings, setNotificationSettings] = useState<{[key:number]: NotificationSettings}>(() => {
    const stored = localStorage.getItem('teamNotificationSettings');
    return stored ? JSON.parse(stored) : {};
  });
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [tempSettings, setTempSettings] = useState<NotificationSettings>({
    enabled: true,
    matchStart: true,
    scoreChange: true,
    matchEnd: true,
    beforeMatch: 15
  });
  const dispatch = useDispatch();

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/teams', {
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

  const toggleFavorite = (team: Team) => {
    let updated;
    if (favoriteTeams.includes(team.id)) {
      updated = favoriteTeams.filter(id => id !== team.id);
      toast.info(`${team.name} favorilerden çıkarıldı`);
    } else {
      updated = [...favoriteTeams, team.id];
      toast.success(`${team.name} favorilere eklendi`);
    }
    setFavoriteTeams(updated);
    localStorage.setItem('favoriteTeams', JSON.stringify(updated));
  };

  const handleNotificationSettings = (team: Team) => {
    setSelectedTeam(team);
    setTempSettings(notificationSettings[team.id] || {
      enabled: true,
      matchStart: true,
      scoreChange: true,
      matchEnd: true,
      beforeMatch: 15
    });
    setNotificationDialogOpen(true);
  };

  const saveNotificationSettings = () => {
    if (selectedTeam) {
      const updatedSettings = {
        ...notificationSettings,
        [selectedTeam.id]: tempSettings
      };
      setNotificationSettings(updatedSettings);
      localStorage.setItem('teamNotificationSettings', JSON.stringify(updatedSettings));
      toast.success(`${selectedTeam.name} için bildirim ayarları kaydedildi`);
    }
    setNotificationDialogOpen(false);
  };

  const hasActiveNotifications = (teamId: number) => {
    const settings = notificationSettings[teamId];
    return settings && settings.enabled && (settings.matchStart || settings.scoreChange || settings.matchEnd);
  };

  const simulateNotification = (type: keyof typeof notificationMessages, teamName: string) => {
    toast.info(notificationMessages[type](teamName), { autoClose: 5000 });
    dispatch(addNotification({
      id: `${teamName}-${type}-${Date.now()}`,
      title: teamName,
      message: notificationMessages[type](teamName),
      timestamp: new Date(),
      read: false,
      type: type as 'matchStart' | 'scoreChange' | 'matchEnd'
    }));
  };

  const isFavorite = (teamId: number) => favoriteTeams.includes(teamId);

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
              onChange={e => setSearch(e.target.value)}
              className="team-search"
            />
            <SearchIcon style={{ position: 'absolute', left: 8, color: 'rgba(255, 255, 255, 0.7)', fontSize: 20 }} />
            {search && (
              <IconButton size="small" onClick={() => setSearch('')} style={{ position: 'absolute', right: 4, color: 'rgba(255, 255, 255, 0.7)' }}>
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
            onChange={(e) => setSelectedRegion(e.target.value)}
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
                  onClick={() => toggleFavorite(team)}
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
            {hasActiveNotifications(team.id) && (
              <div style={{marginTop: 8, display: 'flex', gap: 8}}>
                <Button size="small" variant="outlined" onClick={() => simulateNotification('matchStart', team.name)}>Maç Başlangıcı Bildirimi</Button>
                <Button size="small" variant="outlined" onClick={() => simulateNotification('scoreChange', team.name)}>Skor Bildirimi</Button>
                <Button size="small" variant="outlined" onClick={() => simulateNotification('matchEnd', team.name)}>Maç Sonu Bildirimi</Button>
              </div>
            )}
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
                  checked={tempSettings.scoreChange}
                  onChange={e => setTempSettings(prev => ({ ...prev, scoreChange: e.target.checked }))}
                  disabled={!tempSettings.enabled}
                />
              }
              label="Skor Güncellemelerinde Bildir"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationDialogOpen(false)}>İptal</Button>
          <Button onClick={saveNotificationSettings} variant="contained" color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Teams; 