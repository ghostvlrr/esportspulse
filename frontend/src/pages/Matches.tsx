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
  useTheme,
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

interface NotificationSettings {
  enabled: boolean;
  beforeMatch: number; // dakika cinsinden
  matchStart: boolean;
  matchEnd: boolean;
  scoreUpdate: boolean;
}

interface Match {
  id: string;
  team1: string;
  team2: string;
  team1Logo?: string;
  team2Logo?: string;
  team1_logo_url?: string;
  team2_logo_url?: string;
  score1?: string;
  score2?: string;
  time_completed?: string;
  time_until_match?: string;
  match_event?: string;
  match_series?: string;
  tournament_name?: string;
  round_info?: string;
  status?: string;
  match_page?: string;
  tournament_icon?: string;
  tournamentIcon?: string;
  date: Date;
  notifications?: NotificationSettings;
  team1LogoPng?: string;
  team1LogoSvg?: string;
  team2LogoPng?: string;
  team2LogoSvg?: string;
  _rowIndex?: number;
  parsed_date?: string;
}

type FilterType = 'all' | 'live' | 'upcoming' | 'past';

const filterLabels: Record<FilterType, string> = {
  all: 'Tümü',
  live: 'Canlı',
  upcoming: 'Yaklaşan',
  past: 'Tamamlanan',
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
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
    : theme.palette.primary.main,
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
    status === 'live' ? alpha(theme.palette.success.main, 0.1) :
    status === 'completed' ? alpha(theme.palette.info.main, 0.1) :
    alpha(theme.palette.warning.main, 0.1),
  color: 
    status === 'live' ? theme.palette.success.main :
    status === 'completed' ? theme.palette.info.main :
    theme.palette.warning.main,
  fontWeight: 600,
  '& .MuiChip-label': {
    padding: '0 12px',
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.background.paper, 0.05),
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.08),
  },
}));

const AnimatedTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
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

const normalizeName = (str: string) => {
  console.log('Normalize edilecek isim:', str);
  const normalized = str
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ğ/g, 'g')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, '-')
    .trim();
  console.log('Normalize edilmiş sonuç:', normalized);
  return normalized;
};

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
  console.log('Turnuva adı:', tName);
  
  // Esports World Cup 2025 için özel logo
  if (normalizeName(tName) === 'esports world cup 2025') {
    return 'https://owcdn.net/img/6814dc624bb4c.png';
  }
  
  // Normalize edilmiş turnuva adı ile local events/processed dizininden logo çek
  const normalizedName = normalizeName(tName);
  console.log('Normalize edilmiş isim:', normalizedName);
  const logoPath = `/events/processed/${normalizedName}.png`;
  console.log('Logo yolu:', logoPath);
  return logoPath;
};

const Matches: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [favorites, setFavorites] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false,
    beforeMatch: 15,
    matchStart: true,
    matchEnd: true,
    scoreUpdate: true,
  });
  const [selectedRawDate, setSelectedRawDate] = useState<string>('');

  // Bildirim sayısını güncelle
  const updateNotificationCount = useCallback(() => {
    const count = matches.filter(match => 
      match.notifications?.enabled && 
      !match.time_completed && 
      match.time_until_match !== 'LIVE'
    ).length;
    setUnreadNotifications(count);
  }, [matches]);

  useEffect(() => {
    updateNotificationCount();
  }, [matches, updateNotificationCount]);

  useEffect(() => {
    const fetchMatches = async () => {
    setLoading(true);
      try {
        let response;
        // Sadece 'past' sekmesinde tarih parametresi gönder
        const params: any = {};
        if (filter === 'past') {
          if (selectedRawDate) {
            params.date = selectedRawDate; // yyyy-MM-dd formatında
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
            console.log('DatePicker value:', selectedDate);
            console.log('Backend\'e gönderilen:', params.date);
          }
        }
        switch (filter) {
          case 'live':
            response = await matchService.getLiveMatches();
            break;
          case 'upcoming':
            response = await matchService.getMatches({ status: 'upcoming' });
            break;
          case 'past':
            response = await matchService.getMatches({ ...params, status: 'past' });
            break;
          default:
            response = await matchService.getMatches();
        }

        // API'den gelen cevabı konsola yazdır
        console.log('API response:', response);

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

          // Takım logoları için normalize edilmiş isimle hem .png hem .svg dene
          const team1LogoPng = match.team1 ? '/logos/' + normalize(match.team1) + '.png' : null;
          const team1LogoSvg = match.team1 ? '/logos/' + normalize(match.team1) + '.svg' : null;
          const team2LogoPng = match.team2 ? '/logos/' + normalize(match.team2) + '.png' : null;
          const team2LogoSvg = match.team2 ? '/logos/' + normalize(match.team2) + '.svg' : null;

          // Turnuva logosu için sadece normalize edilmiş .png yolunu kullan
          const tournamentLogoName = match.tournament_name
            ? `/events/${normalize(match.tournament_name)}.png`
            : '/events/default-tournament-logo.png';

          const tournamentIcon = match.tournament_icon
            || match.tournamentIcon
            || tournamentLogoName
            || DEFAULT_TOURNAMENT_LOGO;

          // Benzersiz anahtar oluştur
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

          return {
            ...match,
            team1LogoPng,
            team1LogoSvg,
            team2LogoPng,
            team2LogoSvg,
            tournamentIcon,
            date: matchDate,
            notifications,
          };
        });

        setMatches(matchesWithLogos);
      } catch (error) {
        console.error('Maçlar yüklenirken hata oluştu:', error);
        toast.error('Maçlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        setMatches([]);
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

  const filteredMatches = useMemo(() => {
    let result = matches;
    if (filter === 'past') {
      result = result.filter(match => match.time_completed);
      if (selectedDate) {
        const selectedDay = new Date(selectedDate);
        selectedDay.setHours(0, 0, 0, 0);
        
        result = result.filter(match => {
          if (!match.time_completed) return false;
          try {
            const matchDate = match.parsed_date ? new Date(match.parsed_date) : (match.date ? new Date(match.date) : null);
            if (!matchDate) return false;
            matchDate.setHours(0, 0, 0, 0);
            return matchDate.getTime() === selectedDay.getTime();
          } catch {
            return false;
          }
        });
      }
      return result;
    }
    // Diğer sekmelerde tarih filtreleme yapılmasın
    if (filter === 'all') return result.filter(match => !match.time_completed);
    if (filter === 'live') return result.filter(match => match.time_until_match === 'LIVE');
    if (filter === 'upcoming') return result.filter(match => match.time_until_match && match.time_until_match !== 'LIVE');
    return result;
  }, [matches, filter, selectedDate]);

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
    } catch (error) {
      toast.error('Favori işlemi sırasında bir hata oluştu');
    }
  }, [favorites]);

  const handleNotificationSettings = (match: Match, index: number) => {
    setSelectedMatch({ ...match, _rowIndex: index });
    setNotificationSettings({
      enabled: match.notifications?.enabled ?? false,
      beforeMatch: typeof match.notifications?.beforeMatch === 'number' ? match.notifications.beforeMatch : 15,
      matchStart: typeof match.notifications?.matchStart === 'boolean' ? match.notifications.matchStart : true,
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
      };
      localStorage.setItem(`match_notifications_${uniqueKey}`, JSON.stringify(updatedSettings));
      setMatches(prev => prev.map((m, idx) => m.id === selectedMatch.id && idx === selectedMatch._rowIndex ? { ...m, notifications: updatedSettings } : m));
      if (notificationSettings.enabled) {
        playNotificationSound();
        showWebNotification('Harika! Bildirimler Açıldı', {
          body: `${selectedMatch.team1} ile ${selectedMatch.team2} arasındaki maç için bildirimleri açtın. Heyecanı kaçırma!`,
          icon: '/notification-icon.png'
        });
      }
    }
    setNotificationDialogOpen(false);
  };

  // Tüm bildirimleri kapat fonksiyonu
  const closeAllNotifications = () => {
    setMatches(prev => prev.map((m, idx) => {
      if (m.notifications?.enabled) {
        const uniqueKey = `${m.id}_${m.team1}_${m.team2}_${m.tournament_name || m.match_event}`;
        const updatedSettings = {
          ...m.notifications,
          enabled: false
        };
        localStorage.setItem(`match_notifications_${uniqueKey}`, JSON.stringify(updatedSettings));
        return { ...m, notifications: updatedSettings };
      }
      return m;
    }));
  };

  // Bildirim ikonunu güncelle
  const getNotificationIcon = (match: Match) => {
    if (!match.notifications?.enabled) {
      return <NotificationsIcon />;
    }
    if (match.time_completed) {
      return <NotificationsOffIcon />;
    }
    if (match.time_until_match === 'LIVE') {
      return <NotificationsActiveIcon color="error" />;
    }
    return <NotificationsActiveIcon color="success" />;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }} role="main" aria-label="Maç Listesi">
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
                  style={{
                    height: 44,
                    fontSize: 16,
                    borderRadius: 10,
                    border: '2px solid #00f5ff',
                    background: 'rgba(10, 20, 40, 0.95)',
                    color: '#fff',
                    padding: '0 16px',
                    minWidth: 220,
                    outline: 'none',
                    boxShadow: '0 2px 12px rgba(0,245,255,0.10)',
                    transition: 'border 0.2s, box-shadow 0.2s',
                    fontWeight: 500,
                    letterSpacing: 1,
                  }}
                  onFocus={e => e.currentTarget.style.border = '2px solid #00bcd4'}
                  onBlur={e => e.currentTarget.style.border = '2px solid #00f5ff'}
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
                    <Badge badgeContent={unreadNotifications} color="error">
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
                              <Tooltip title={match.time_completed ? t('notifications.disabled.completed') : (match.time_until_match === 'LIVE' ? t('notifications.disabled.live') : (match.notifications?.enabled ? t('notifications.edit') : t('notifications.add')))}>
                                <span>
                                  <IconButton
                                    onClick={() => handleNotificationSettings(match, index)}
                                    aria-label={match.notifications?.enabled ? t('notifications.edit') : t('notifications.add')}
                                    disabled={Boolean(match.time_completed) || match.time_until_match === 'LIVE'}
                                  >
                                    {getNotificationIcon(match)}
                                  </IconButton>
                                </span>
                              </Tooltip>
                              {match.notifications && match.notifications.enabled && !match.time_completed && match.time_until_match !== 'LIVE' && (
                                <Tooltip title="Bildirimi kapat">
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => {
                                      const updatedSettings = {
                                        enabled: false,
                                        beforeMatch: typeof match.notifications?.beforeMatch === 'number' ? match.notifications.beforeMatch : 15,
                                        matchStart: typeof match.notifications?.matchStart === 'boolean' ? match.notifications.matchStart : true,
                                        matchEnd: typeof match.notifications?.matchEnd === 'boolean' ? match.notifications.matchEnd : true,
                                        scoreUpdate: typeof match.notifications?.scoreUpdate === 'boolean' ? match.notifications.scoreUpdate : true,
                                      };
                                      localStorage.setItem(`match_notifications_${match.id}`, JSON.stringify(updatedSettings));
                                      setMatches(prev => prev.map((m, idx) => m.id === match.id && idx === index ? { ...m, notifications: updatedSettings } : m));
                                    }}
                                  >
                                    <NotificationsOffIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
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
                                  {match.time_until_match}
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
                  <FormControl fullWidth sx={{ mb: 2 }}>
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
            disabled={!notificationSettings.enabled}
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