import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { matchService } from '../services/api';
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Box,
  CircularProgress,
  Fade,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Badge,
  Alert,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { format as formatDate, isToday, isTomorrow, isYesterday } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import '../styles/Matches.css';
import { useNotifications } from '../hooks/useNotifications';
import { Match, NotificationSettings } from '../types/match';

type FilterType = 'all' | 'live' | 'upcoming' | 'past';

const filterLabels: Record<FilterType, string> = {
  all: 'Tümü',
  live: 'Canlı',
  upcoming: 'Yaklaşan',
  past: 'Tamamlanan',
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: 'rgba(255,0,0,0.1)',
    color: '#FF0000',
    fontWeight: 600,
  },
  '&.MuiTableCell-body': {
    fontSize: 14,
  },
}));

interface FilterButtonProps {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
  variant: 'text' | 'contained';
  'aria-pressed'?: boolean;
  'aria-label'?: string;
}

const FilterButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'active',
})<FilterButtonProps>(({ theme, active }) => ({
  backgroundColor: active 
    ? theme.palette.primary.main 
    : alpha(theme.palette.primary.main, 0.1),
  color: active 
    ? theme.palette.primary.contrastText 
    : '#fff',
  '&:hover': {
    backgroundColor: active 
      ? theme.palette.primary.dark 
      : alpha(theme.palette.primary.main, 0.2),
  },
  transition: 'all 0.3s ease',
  borderRadius: theme.shape.borderRadius,
  padding: '8px 16px',
  textTransform: 'none',
  fontWeight: 600,
}));

interface StatusChipProps {
  status: string;
}

const StatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'status',
})<StatusChipProps>(({ theme, status }) => ({
  backgroundColor: 
    status === 'live' ? 'rgba(255,0,0,0.1)' :
    status === 'completed' ? 'rgba(255,255,255,0.1)' :
    'rgba(23,23,23,0.1)',
  color: 
    status === 'live' ? '#FF0000' :
    status === 'completed' ? '#FFFFFF' :
    '#FFFFFF',
  fontWeight: 600,
  '& .MuiChip-label': {
    padding: '0 12px',
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'rgba(23,23,23,0.05)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(23,23,23,0.08)',
  },
}));

const AnimatedTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: 'rgba(255,0,0,0.05)',
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
    backdropFilter: 'blur(10px)',
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(2),
  },
}));

const NotificationSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase': {
    '&.Mui-checked': {
      color: theme.palette.primary.main,
      '& + .MuiSwitch-track': {
        backgroundColor: alpha(theme.palette.primary.main, 0.5),
      },
    },
  },
  '& .MuiSwitch-track': {
    backgroundColor: alpha(theme.palette.common.white, 0.2),
  },
}));

const DEFAULT_TOURNAMENT_LOGO = '/logos/default-tournament-logo.svg';

const getDateLabel = (date: Date | null | undefined) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '-';
  }

  try {
    // Tarihi yerel saat dilimine çevir
    const localDate = new Date(date.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }));
    
    if (isToday(localDate)) return 'Bugün';
    if (isTomorrow(localDate)) return 'Yarın';
    if (isYesterday(localDate)) return 'Dün';
    return formatDate(localDate, 'd MMMM yyyy', { locale: tr });
  } catch (error) {
    console.error('Tarih formatlanırken hata:', error);
    return '-';
  }
};

const StatusCell = styled(TableCell)(({ theme }) => ({
  textAlign: 'center',
  minWidth: 90,
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1.5, 2),
}));

const TimeCell = styled(TableCell)(({ theme }) => ({
  textAlign: 'right',
  minWidth: 120,
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1.5, 2),
}));

// Takım ve turnuva logoları için normalize fonksiyonu (Türkçe karakter desteği)
const normalize = (str: string) =>
  str
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ğ/g, 'g')
    .replace(/[^a-z0-9]/g, '');

const getNotificationFromStorage = (id: string): NotificationSettings => {
  try {
    const data = localStorage.getItem(`match_notifications_${id}`);
    if (data) {
      const obj = JSON.parse(data);
      return { ...obj };
    }
  } catch {}
  return {
    enabled: false,
    beforeMatch: 15,
    matchStart: true,
    matchEnd: true,
    scoreUpdate: true,
  };
};

// Bildirim sesi ve web notification fonksiyonları
const playNotificationSound = () => {
  const audio = new Audio('/notification.mp3');
  audio.play();
};

const showWebNotification = (title: string, options: NotificationOptions) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options);
  }
};

// Turnuva logosu için url önceliği: http/https ile başlıyorsa onu kullan, yoksa local events, yoksa default
const getTournamentLogo = (match: Match) => {
  const tName = match.tournament_name || match.match_event || '';
  const normalizedName = normalize(tName);
  const logoPath = `/events/processed/${normalizedName}.png`;
  return logoPath;
};

// Bildirim mesaj havuzları
const finalMessages = [
  "Büyük final zamanı! {team1} ile {team2} şampiyonluk için karşı karşıya!",
  "Tarihe tanıklık et! {team1} vs {team2} finali başlıyor!",
  "Şampiyon belli oluyor! {team1} ve {team2} kozlarını paylaşıyor!"
];
const semiFinalMessages = [
  "Yarı final heyecanı! {team1} ile {team2} finale bir adım uzaklıkta.",
  "Finale giden yol: {team1} vs {team2} yarı finalde karşı karşıya!"
];
const groupMessages = [
  "Grup aşaması başlıyor! {team1} ve {team2} sahnede.",
  "Puanlar için mücadele: {team1} vs {team2} grup maçı!"
];
const showmatchMessages = [
  "Gösteri zamanı! {team1} ile {team2} eğlenceli bir maçta karşı karşıya.",
  "Şov başlasın! {team1} vs {team2} gösteri maçı için hazır."
];
const defaultMessages = [
  "Heyecan başlıyor! {team1} vs {team2} maçı için bildirimler açık!",
  "Hazır mısın? {team1} ile {team2} arasındaki mücadele başlamak üzere!",
  "Maç başlıyor! {team1} ve {team2} karşı karşıya, gözünü ayırma!",
  "Koltuklara kurul! {team1} vs {team2} maçı için bildirimler aktif.",
  "Sahne senin! {team1} ile {team2} maçı başlamak üzere, heyecan dorukta!",
  "Büyük an geldi! {team1} ve {team2} kozlarını paylaşacak!",
  "Takımlar arenada! {team1} vs {team2} maçı için bildirimler açık.",
  "Adrenalin tavan! {team1} ile {team2} maçı başlamak üzere.",
  "Şampiyonluk yolunda {team1} ve {team2} karşı karşıya!",
  "Efsane bir maç seni bekliyor: {team1} vs {team2}!"
];

function getRandomMessage(messages: string[], team1: string, team2: string) {
  const msg = messages[Math.floor(Math.random() * messages.length)];
  return msg.replace('{team1}', team1).replace('{team2}', team2);
}

function getImportanceMessage(round: string, team1: string, team2: string) {
  if (!round) return getRandomMessage(defaultMessages, team1, team2);
  const r = round.toLowerCase();
  if (r.includes('final') && !r.includes('yarı')) return getRandomMessage(finalMessages, team1, team2);
  if (r.includes('yarı')) return getRandomMessage(semiFinalMessages, team1, team2);
  if (r.includes('grup')) return getRandomMessage(groupMessages, team1, team2);
  if (r.includes('show')) return getRandomMessage(showmatchMessages, team1, team2);
  return getRandomMessage(defaultMessages, team1, team2);
}

// Kalan süreyi Türkçeleştirici fonksiyonu tekrar ekle
function formatTimeUntilTr(timeStr: string): string {
  if (!timeStr) return '';
  return timeStr
    .replace(/from now/i, '')
    .replace(/(\d+)d/g, '$1 gün')
    .replace(/(\d+)h/g, '$1 saat')
    .replace(/(\d+)m/g, '$1 dakika')
    .trim();
}

const Matches: React.FC = () => {
  const { t } = useTranslation();
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [favorites, setFavorites] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false,
    beforeMatch: 15,
    matchStart: true,
    matchEnd: true,
    scoreUpdate: true,
  });
  const [selectedRawDate, setSelectedRawDate] = useState<string>('');
  const { notifications, setNotifications } = useNotifications();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        let response;
        const params: any = {};
        if (filter === 'past') {
          if (selectedRawDate) {
            params.date = selectedRawDate;
          } else if (selectedDate) {
            let dateToSend: Date;
            if (typeof selectedDate === 'string') {
              const strDate = selectedDate as string;
              if (strDate.includes('.')) {
                const [day, month, year] = strDate.split('.');
                dateToSend = new Date(`${year}-${month}-${day}`);
              } else {
                dateToSend = new Date(strDate);
              }
            } else if (selectedDate instanceof Date) {
              dateToSend = selectedDate;
            } else {
              dateToSend = new Date(selectedDate as any);
            }
            params.date = formatDate(dateToSend, 'yyyy-MM-dd');
          }
        }
        switch (filter) {
          case 'live':
            response = await matchService.getMatches();
            break;
          case 'upcoming':
            response = await matchService.getMatches();
            break;
          case 'past':
            response = await matchService.getMatches();
            break;
          default:
            response = await matchService.getMatches();
        }

        if (!response || response.length === 0) {
          toast.info('Seçili kriterlere uygun maç bulunamadı.');
        }

        const matchesWithLogos = response.map((match: Match) => {
          let matchDate: Date | null = null;
          if (match.parsed_date) {
            matchDate = new Date(match.parsed_date);
          } else if (match.date) {
            matchDate = new Date(match.date);
          } else if (match.time_until_match && match.time_until_match !== 'LIVE') {
            matchDate = new Date(match.time_until_match);
          } else if (match.time_completed) {
            matchDate = new Date(match.time_completed);
          }
          if (matchDate && isNaN(matchDate.getTime())) {
            matchDate = null;
          }

          const team1LogoPng = match.team1 ? '/logos/' + normalize(match.team1) + '.png' : null;
          const team1LogoSvg = match.team1 ? '/logos/' + normalize(match.team1) + '.svg' : null;
          const team2LogoPng = match.team2 ? '/logos/' + normalize(match.team2) + '.png' : null;
          const team2LogoSvg = match.team2 ? '/logos/' + normalize(match.team2) + '.svg' : null;

          const tournamentLogoName = match.tournament_name
            ? `/events/${normalize(match.tournament_name)}.png`
            : '/events/default-tournament-logo.png';

          const tournamentIcon = match.tournament_icon
            || match.tournamentIcon
            || tournamentLogoName
            || DEFAULT_TOURNAMENT_LOGO;

          const uniqueKey = `${match.id}_${match.team1}_${match.team2}_${match.tournament_name || match.match_event}`;
          let notifications: NotificationSettings;
          if (match.notifications) {
            notifications = {
              enabled: match.notifications.enabled === true,
              beforeMatch: typeof match.notifications.beforeMatch === 'number' ? match.notifications.beforeMatch : 15,
              matchStart: typeof match.notifications.matchStart === 'boolean' ? match.notifications.matchStart : true,
              matchEnd: typeof match.notifications.matchEnd === 'boolean' ? match.notifications.matchEnd : true,
              scoreUpdate: typeof match.notifications.scoreUpdate === 'boolean' ? match.notifications.scoreUpdate : true,
            };
          } else {
            notifications = getNotificationFromStorage(uniqueKey);
          }

          let status: 'live' | 'upcoming' | 'completed' = 'upcoming';
          if (match.time_completed) {
            status = 'completed';
          } else if (match.time_until_match === 'LIVE') {
            status = 'live';
          } else {
            status = 'upcoming';
          }

          return {
            ...match,
            team1LogoPng,
            team1LogoSvg,
            team2LogoPng,
            team2LogoSvg,
            tournamentIcon,
            notifications,
            status,
            matchDate
          };
        });

        setMatches(matchesWithLogos);
      } catch (error) {
        setError('Maçlar yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [filter, selectedDate, selectedRawDate]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Maç durumlarını kontrol et
  useEffect(() => {
    const checkMatchStatus = () => {
      setMatches(prevMatches => {
        return prevMatches.map(match => {
          if (!match.notifications?.enabled) return match;

          const now = new Date();
          const matchDate = match.date ? new Date(match.date) : null;

          if (!matchDate) return match;

          // Maç başlangıcı kontrolü
          if (match.notifications.matchStart && !match.time_completed && match.time_until_match !== 'LIVE') {
            const timeUntilMatch = matchDate.getTime() - now.getTime();
            if (timeUntilMatch <= 0 && timeUntilMatch > -60000) { // Son 1 dakika içinde
              playNotificationSound();
              showWebNotification('Maç Başladı!', {
                body: `${match.team1} vs ${match.team2} maçı başladı!`,
                icon: '/notification-icon.png'
              });
            }
          }

          // Skor değişikliği kontrolü
          if (match.notifications.scoreUpdate && match.time_until_match === 'LIVE') {
            // Skor değişikliği kontrolü backend'den gelecek
          }

          // Maç sonu kontrolü
          if (match.notifications.matchEnd && match.time_completed) {
            playNotificationSound();
            showWebNotification('Maç Sona Erdi!', {
              body: `${match.team1} vs ${match.team2} maçı sona erdi!`,
              icon: '/notification-icon.png'
            });
          }

          return match;
        });
      });
    };

    const interval = setInterval(checkMatchStatus, 30000); // Her 30 saniyede bir kontrol et
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (matches.length > 0 && selectedDate) {
      console.log('Seçilen:', formatDate(selectedDate, 'yyyy-MM-dd'));
      matches.forEach(m => {
        if (m.date) {
          const matchDateObj = new Date(m.date);
          console.log('Maç:', formatDate(matchDateObj, 'yyyy-MM-dd'), m);
        }
      });
    }
  }, [matches, selectedDate]);

  const getStatusChip = useCallback((match: Match) => {
    if (match.time_until_match === 'LIVE') {
      return <StatusChip status="live" label="Canlı" size="small" />;
    } else if (match.time_completed) {
      return <StatusChip status="completed" label="Tamamlandı" size="small" />;
    } else if (match.time_until_match) {
      return <StatusChip status="upcoming" label="Yaklaşan" size="small" />;
    }
    return '-';
  }, []);

  // Filtreleme işlemlerini memoize et
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      if (filter === 'live') {
        return match.time_until_match === 'LIVE';
      } else if (filter === 'upcoming') {
        return !match.time_completed && match.time_until_match !== 'LIVE';
      } else if (filter === 'past') {
        return match.status === 'completed';
      } else if (filter === 'all') {
        // Tümü sekmesinde tamamlanmış maçlar gösterilmesin
        return match.status !== 'completed';
      }
      return true;
    });
  }, [matches, filter]);

  // Okunmamış bildirimleri say
  const unreadCount = useMemo(() => {
    return notifications.filter((n: { read: boolean }) => !n.read).length;
  }, [notifications]);

  // Tüm bildirimleri kapat
  const closeAllNotifications = useCallback(() => {
    // LocalStorage'daki tüm maç bildirimlerini sil
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('match_notifications_') || key.startsWith('match_notification_message_') || key.startsWith('match_notification_time_')) {
        localStorage.removeItem(key);
      }
    });
    // Redux store'daki bildirimleri temizle
    setNotifications([]);
    toast.success('Tüm bildirimler kapatıldı');
  }, [setNotifications]);

  const toggleFavorite = useCallback((match: Match) => {
    try {
      const id = `${match.team1}-${match.team2}-${match.match_event || match.tournament_name}`;
      let favs = [...favorites];
      if (favs.includes(id)) {
        favs = favs.filter(f => f !== id);
        toast.success('Maç favorilerden çıkarıldı');
      } else {
        favs.push(id);
        toast.success('Maç favorilere eklendi');
      }
      setFavorites(favs);
      localStorage.setItem('favorites', JSON.stringify(favs));
      window.dispatchEvent(new Event('favoritesChanged'));
    } catch (error) {
      toast.error('Favori işlemi sırasında bir hata oluştu');
    }
  }, [favorites]);

  const handleNotificationSettings = (match: Match, index: number) => {
    if (match.time_completed) return;
    setSelectedMatch({ ...match, _rowIndex: index });
    setNotificationSettings({
      enabled: match.notifications?.enabled ?? false,
      beforeMatch: match.time_until_match === 'LIVE' ? 0 : (typeof match.notifications?.beforeMatch === 'number' ? match.notifications.beforeMatch : 15),
      matchStart: match.time_until_match === 'LIVE' ? false : (typeof match.notifications?.matchStart === 'boolean' ? match.notifications.matchStart : true),
      matchEnd: typeof match.notifications?.matchEnd === 'boolean' ? match.notifications.matchEnd : true,
      scoreUpdate: typeof match.notifications?.scoreUpdate === 'boolean' ? match.notifications.scoreUpdate : true,
    });
    setNotificationDialogOpen(true);
  };

  const saveNotificationSettings = () => {
    if (selectedMatch && typeof selectedMatch._rowIndex === 'number') {
      const uniqueKey = `${selectedMatch.id}_${selectedMatch.team1}_${selectedMatch.team2}_${selectedMatch.tournament_name || selectedMatch.match_event}`;
      const updatedSettings = {
        enabled: notificationSettings.enabled,
        beforeMatch: notificationSettings.beforeMatch,
        matchStart: notificationSettings.matchStart,
        matchEnd: notificationSettings.matchEnd,
        scoreUpdate: notificationSettings.scoreUpdate,
        round_info: selectedMatch.round_info || selectedMatch.match_series || '',
      };
      if (notificationSettings.enabled) {
        const messageKey = `match_notification_message_${uniqueKey}`;
        const randomMessage = getImportanceMessage(updatedSettings.round_info, selectedMatch.team1, selectedMatch.team2);
        localStorage.setItem(messageKey, randomMessage);
        const timeKey = `match_notification_time_${uniqueKey}`;
        localStorage.setItem(timeKey, new Date().toISOString());
      }
      localStorage.setItem(`match_notifications_${uniqueKey}`, JSON.stringify(updatedSettings));
      setMatches(prev => prev.map((m, idx) => m.id === selectedMatch.id && idx === selectedMatch._rowIndex ? { ...m, notifications: updatedSettings } : m));
      if (notificationSettings.enabled) {
        playNotificationSound();
        showWebNotification('Harika! Bildirimler Açıldı', {
          body: `${selectedMatch.team1} ile ${selectedMatch.team2} arasındaki maç için bildirimleri açtın. Heyecanı kaçırma!`,
          icon: '/notification-icon.png'
        });
      } else {
        toast.info('Bu maç için bildirimler kapatıldı');
      }
    }
    setNotificationDialogOpen(false);
  };

  // Bildirim ikonunu güncelle
  const getNotificationIcon = (match: Match) => {
    if (match.notifications?.enabled) {
      return <NotificationsActiveIcon color="success" />;
    }
    return <NotificationsOffIcon color="disabled" />;
  };

  useEffect(() => {
    // Tamamlanan maçları favorilerden otomatik çıkar
    if (!matches || !favorites) return;
    const completedIds = matches
      .filter(match => match.time_completed)
      .map(match => `${match.team1}-${match.team2}-${match.match_event || match.tournament_name}`);
    const newFavorites = favorites.filter(fav => !completedIds.includes(fav));
    if (newFavorites.length !== favorites.length) {
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      window.dispatchEvent(new Event('favoritesChanged'));
    }
  }, [matches, favorites]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }} role="main" aria-label="Maç Listesi">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom>
              Maçlar
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', alignItems: 'center' }}>
              {filter === 'past' && (
                <input
                  type="date"
                  value={selectedRawDate}
                  onChange={e => setSelectedRawDate(e.target.value)}
                  min={(() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 7);
                    return d.toISOString().split('T')[0];
                  })()}
                  max={(() => {
                    const d = new Date();
                    return d.toISOString().split('T')[0];
                  })()}
                  style={{
                    height: 44,
                    fontSize: 16,
                    borderRadius: 10,
                    border: '2px solid #FF0000',
                    background: 'rgba(23, 23, 23, 0.95)',
                    color: '#fff',
                    padding: '0 16px',
                    minWidth: 220,
                    outline: 'none',
                    boxShadow: '0 2px 12px rgba(255,0,0,0.10)',
                    transition: 'border 0.2s, box-shadow 0.2s',
                    fontWeight: 500,
                    letterSpacing: 1,
                  }}
                  onFocus={e => e.currentTarget.style.border = '2px solid #CC0000'}
                  onBlur={e => e.currentTarget.style.border = '2px solid #FF0000'}
                />
              )}
              {filter === 'past' && (
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => setSelectedDate(null)}
                  disabled={!selectedDate}
                >
                  Filtreyi Temizle
                </Button>
              )}
              {filter !== 'past' && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={closeAllNotifications}
                  sx={{ minWidth: 180 }}
                  startIcon={
                    <Badge badgeContent={unreadCount} color="error">
                      <NotificationsIcon />
                    </Badge>
                  }
                >
                  Tüm Bildirimleri Kapat
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
        {Object.entries(filterLabels).map(([key, label]) => (
            <FilterButton
            key={key}
              active={filter === key}
            onClick={() => setFilter(key as FilterType)}
              variant={filter === key ? 'contained' : 'text'}
              aria-pressed={filter === key}
              aria-label={`${label} maçları göster`}
            >
              {label}
            </FilterButton>
          ))}
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}
            >
              <CircularProgress aria-label="Yükleniyor" />
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="matches-table-scroll">
                <StyledTableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>Favori</StyledTableCell>
                        <StyledTableCell>Bildirim</StyledTableCell>
                        <StyledTableCell>Turnuva</StyledTableCell>
                        <StyledTableCell align="center" sx={{ width: 170 }}>Takım 1</StyledTableCell>
                        <StyledTableCell align="center" sx={{ width: 60 }}>VS</StyledTableCell>
                        <StyledTableCell align="center" sx={{ width: 170 }}>Takım 2</StyledTableCell>
                        <StyledTableCell align="center" sx={{ width: 70 }}>Skor</StyledTableCell>
                        <StyledTableCell>Durum</StyledTableCell>
                        <StyledTableCell>Zaman</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredMatches.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} align="center">
                            <Typography variant="body1" color="text.secondary">
                              Maç bulunamadı
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredMatches.map((match, index) => (
                          <AnimatedTableRow key={`${match.id}-${index}`} sx={{ height: 60 }}>
                            <TableCell align="center" sx={{ verticalAlign: 'middle' }}>
                              <IconButton
                                onClick={() => toggleFavorite(match)}
                                aria-label={favorites.includes(`${match.team1}-${match.team2}-${match.match_event || match.tournament_name}`) 
                                  ? 'Favorilerden çıkar' 
                                  : 'Favorilere ekle'}
                              >
                                {favorites.includes(`${match.team1}-${match.team2}-${match.match_event || match.tournament_name}`) 
                                  ? <FavoriteIcon color="error" /> 
                                  : <FavoriteBorderIcon />}
                              </IconButton>
                            </TableCell>
                            <TableCell align="center" sx={{ verticalAlign: 'middle' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <Tooltip title={match.notifications?.enabled ? 'Bu maç için bildirim açık' : 'Bu maç için bildirim kapalı'}>
                                  <span>
                                    <IconButton
                                      onClick={() => !match.time_completed && handleNotificationSettings(match, index)}
                                      aria-label={match.notifications?.enabled ? 'Bildirimleri Kapat' : 'Bildirimleri Aç'}
                                      disabled={!!match.time_completed}
                                    >
                                      {getNotificationIcon(match)}
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ verticalAlign: 'middle', minWidth: 200 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                <img
                                  src={getTournamentLogo(match)}
                                  alt={match.tournament_name}
                                  style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 8,
                                    objectFit: 'cover',
                                    border: '1.5px solid #333',
                                    background: '#222',
                                    flexShrink: 0
                                  }}
                                  onError={e => { e.currentTarget.src = '/events/default-tournament-logo.png'; }}
                                />
                                <Typography variant="body1" fontWeight={600} sx={{ ml: 1 }}>
                                  {match.tournament_name || match.match_event || '-'}
                                </Typography>
                              </Box>
                            </TableCell>
                            {/* Takım 1 kutusu */}
                            <TableCell align="center" sx={{ verticalAlign: 'middle', width: 170 }}>
                              <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: 1,
                                background: 'rgba(255,255,255,0.06)',
                                borderRadius: 2,
                                px: 1.5,
                                py: 0.5,
                                height: 40,
                                minWidth: 150,
                                maxWidth: 170,
                                transition: 'background 0.2s'
                              }}>
                                <Box sx={{
                                  width: 40,
                                  height: 40,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: '#181c27',
                                  borderRadius: '50%'
                                }}>
                                  <img
                                    src={match.team1LogoPng || match.team1LogoSvg || match.team1_logo_url || '/logos/default.png'}
                                    alt={match.team1}
                                    style={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: '50%',
                                      objectFit: 'cover',
                                      border: '1.5px solid #333',
                                      background: '#222',
                                      flexShrink: 0
                                    }}
                                    onError={(e) => { e.currentTarget.src = '/logos/default.png'; }}
                                  />
                                </Box>
                                <Typography
                                  variant="body2"
                                  fontWeight={700}
                                  sx={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: 90,
                                    lineHeight: 1,
                                    ml: 1,
                                    height: 34,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end'
                                  }}
                                  title={match.team1}
                                >
                                  {match.team1}
                                </Typography>
                              </Box>
                            </TableCell>
                            {/* VS kutusu */}
                            <TableCell align="center" sx={{ verticalAlign: 'middle', width: 60 }}>
                              <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 40,
                                minWidth: 40,
                                height: 40
                              }}>
                                <Box sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  background: 'rgba(255,255,255,0.12)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <Typography variant="body2" color="text.secondary" sx={{
                                    fontWeight: 700,
                                    fontSize: 18,
                                    lineHeight: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    vs
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            {/* Takım 2 kutusu */}
                            <TableCell align="center" sx={{ verticalAlign: 'middle', width: 170 }}>
                              <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                gap: 1,
                                background: 'rgba(255,255,255,0.06)',
                                borderRadius: 2,
                                px: 1.5,
                                py: 0.5,
                                height: 40,
                                minWidth: 150,
                                maxWidth: 170,
                                transition: 'background 0.2s'
                              }}>
                                <Box sx={{
                                  width: 40,
                                  height: 40,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: '#181c27',
                                  borderRadius: '50%'
                                }}>
                                  <img
                                    src={match.team2LogoPng || match.team2LogoSvg || match.team2_logo_url || '/logos/default.png'}
                                    alt={match.team2}
                                    style={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: '50%',
                                      objectFit: 'cover',
                                      border: '1.5px solid #333',
                                      background: '#222',
                                      flexShrink: 0
                                    }}
                                    onError={(e) => { e.currentTarget.src = '/logos/default.png'; }}
                                  />
                                </Box>
                                <Typography
                                  variant="body2"
                                  fontWeight={700}
                                  sx={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: 90,
                                    lineHeight: 1,
                                    ml: 1,
                                    height: 34,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start'
                                  }}
                                  title={match.team2}
                                >
                                  {match.team2}
                                </Typography>
                              </Box>
                            </TableCell>
                            {/* Skor kutusu */}
                            <TableCell align="center" sx={{ verticalAlign: 'middle', width: 70 }}>
                              <Box sx={{
                                background: 'rgba(255,255,255,0.12)',
                                borderRadius: 2,
                                px: 1.5,
                                py: 0.5,
                                minWidth: 40,
                                minHeight: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 0.5
                              }}>
                                {match.score1 !== undefined && match.score2 !== undefined ? (
                                  (() => {
                                    const s1 = Number(match.score1);
                                    const s2 = Number(match.score2);
                                    let color1 = 'text.secondary';
                                    let color2 = 'text.secondary';
                                    if (!isNaN(s1) && !isNaN(s2)) {
                                      if (s1 > s2) {
                                        color1 = 'success.main';
                                      } else if (s2 > s1) {
                                        color2 = 'success.main';
                                      }
                                    }
                                    return (
                                      <>
                                        <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: 16, minWidth: 18, textAlign: 'center' }} color={color1}>{match.score1}</Typography>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: 14, px: 0.5 }}>-</Typography>
                                        <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: 16, minWidth: 18, textAlign: 'center' }} color={color2}>{match.score2}</Typography>
                                      </>
                                    );
                                  })()
                                ) : (
                                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: 14 }}>-</Typography>
                                )}
                              </Box>
                            </TableCell>
                            <StatusCell sx={{ verticalAlign: 'middle' }}>
                              {getStatusChip(match)}
                            </StatusCell>
                            <TimeCell sx={{ verticalAlign: 'middle' }}>
                              <Typography variant="body2" color="text.secondary">
                                {getDateLabel(match.date)}
                                {match.time_until_match && match.time_until_match !== 'LIVE' && !match.time_completed && (
                                  <Box component="span" sx={{ ml: 1 }}>
                                    {formatTimeUntilTr(match.time_until_match)}
                                  </Box>
                                )}
                              </Typography>
                            </TimeCell>
                          </AnimatedTableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      <StyledDialog
        open={notificationDialogOpen}
        onClose={() => setNotificationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
      >
        <DialogTitle>
          <div>
            <Typography variant="h6" component="div">
              {t('notifications.title')}
            </Typography>
            {selectedMatch && (
              <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }} component="div">
                {selectedMatch.team1} vs {selectedMatch.team2}
              </Typography>
            )}
          </div>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <NotificationSwitch
                  checked={notificationSettings.enabled}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    enabled: e.target.checked,
                  })}
                />
              }
              label={t('notifications.enable')}
            />
            
            {notificationSettings.enabled && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ mt: 3 }}>
                  <FormControl fullWidth sx={{ mb: 2 }} disabled={selectedMatch?.time_until_match === 'LIVE'}>
                    <InputLabel>{t('notifications.beforeMatch')}</InputLabel>
                    <Select
                      value={notificationSettings.beforeMatch}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        beforeMatch: Number(e.target.value),
                      })}
                      label={t('notifications.beforeMatch')}
                    >
                      <MenuItem value={5}>{t('notifications.minutes.5')}</MenuItem>
                      <MenuItem value={15}>{t('notifications.minutes.15')}</MenuItem>
                      <MenuItem value={30}>{t('notifications.minutes.30')}</MenuItem>
                      <MenuItem value={60}>{t('notifications.minutes.60')}</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControlLabel
                    control={
                      <NotificationSwitch
                        checked={notificationSettings.matchStart}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          matchStart: e.target.checked,
                        })}
                        disabled={selectedMatch?.time_until_match === 'LIVE'}
                      />
                    }
                    label={t('notifications.matchStart')}
                  />

                  <FormControlLabel
                    control={
                      <NotificationSwitch
                        checked={notificationSettings.matchEnd}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          matchEnd: e.target.checked,
                        })}
                      />
                    }
                    label={t('notifications.matchEnd')}
                  />

                  <FormControlLabel
                    control={
                      <NotificationSwitch
                        checked={notificationSettings.scoreUpdate}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          scoreUpdate: e.target.checked,
                        })}
                      />
                    }
                    label={t('notifications.scoreUpdate')}
                  />
                </Box>
              </motion.div>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setNotificationDialogOpen(false)}
            variant="outlined"
          >
            {t('notifications.cancel')}
          </Button>
          <Button
            onClick={saveNotificationSettings}
            variant="contained"
            startIcon={<NotificationsActiveIcon />}
          >
            {t('notifications.save')}
          </Button>
        </DialogActions>
      </StyledDialog>
    </Container>
  );
};

export default React.memo(Matches); 