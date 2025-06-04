const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const socketIo = require('socket.io');
const puppeteer = require('puppeteer');
const http = require('http');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://esportspulse.vercel.app',
    'https://esportspulse-frontend.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const API_BASE_URL = 'https://vlrggapi.vercel.app';

// Tüm maçları getir
app.get('/api/matches', async (req, res) => {
  try {
    const { status, date } = req.query;
    const [liveResponse, upcomingResponse, pastResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/match?q=live_score`),
      axios.get(`${API_BASE_URL}/match?q=upcoming`),
      axios.get(`${API_BASE_URL}/match?q=results`)
    ]);

    // Turnuva logolarını oku
    const eventsDir = path.join(__dirname, '../frontend/public/events');
    const logoFiles = fs.readdirSync(eventsDir)
      .filter(file => file.endsWith('.png') && file !== 'default-tournament-logo.png')
      .reduce((acc, file) => {
        const name = file.replace('.png', '');
        acc[name.toLowerCase()] = file;
        return acc;
      }, {});

    let allMatches = [
      ...liveResponse.data.data.segments,
      ...upcomingResponse.data.data.segments,
      ...pastResponse.data.data.segments
    ].map(match => {
      // Benzersiz id oluştur
      match.id = match.id || match.match_page || `${match.team1}-${match.team2}-${match.tournament_name || ''}`;
      
      // Turnuva logosunu bul
      const tournamentName = match.tournament_name?.toLowerCase() || '';
      match.tournament_logo = logoFiles[tournamentName] || 'default-tournament-logo.png';

      if (match.time_completed) {
        match.date = match.time_completed;
      } else if (match.time_until_match && match.time_until_match !== 'LIVE') {
        match.date = match.time_until_match;
      }
      return match;
    });

    // status filtresi uygula
    if (status === 'past') {
      allMatches = allMatches.filter(m => m.time_completed);
    }
    if (status === 'live') {
      allMatches = allMatches.filter(m => m.time_until_match === 'LIVE');
    }
    if (status === 'upcoming') {
      allMatches = allMatches.filter(m => m.time_until_match && m.time_until_match !== 'LIVE' && !m.time_completed);
    }

    // date filtresi uygula (sadece tamamlanan maçlar için)
    if (date) {
      // Türkiye saatine göre günün başlangıcı ve bitişi
      const startOfDay = new Date(date + 'T00:00:00+03:00');
      const endOfDay = new Date(date + 'T23:59:59+03:00');

      allMatches = allMatches.filter(m => {
        if (!m.time_completed || typeof m.time_completed !== 'string') return false;
        const matchDate = parseTimeCompleted(m.time_completed);
        return matchDate >= startOfDay && matchDate <= endOfDay;
      });
    }

    res.json(allMatches);
  } catch (error) {
    console.error('Maçlar yüklenirken hata:', error.message);
    res.status(500).json({ error: 'Maçlar yüklenirken bir hata oluştu.' });
  }
});

// Canlı maçları getir
app.get('/api/matches/live', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/match?q=live_score`);
    res.json(response.data.data.segments);
  } catch (error) {
    console.error('Canlı maçlar yüklenirken hata:', error.message);
    res.status(500).json({ error: 'Canlı maçlar yüklenirken bir hata oluştu.' });
  }
});

// Yaklaşan maçları getir
app.get('/api/matches/upcoming', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/match?q=upcoming`);
    res.json(response.data.data.segments);
  } catch (error) {
    console.error('Yaklaşan maçlar yüklenirken hata:', error.message);
    res.status(500).json({ error: 'Yaklaşan maçlar yüklenirken bir hata oluştu.' });
  }
});

// Geçmiş maçları getir
app.get('/api/matches/past', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/match?q=results`);
    res.json(response.data.data.segments);
  } catch (error) {
    console.error('Geçmiş maçlar yüklenirken hata:', error.message);
    res.status(500).json({ error: 'Geçmiş maçlar yüklenirken bir hata oluştu.' });
  }
});

// Haber önbelleği için değişkenler
let newsCache = null;
let lastNewsCacheUpdate = null;
const NEWS_CACHE_DURATION = 30 * 60 * 1000; // 30 dakika

// Haber görsellerini çek
async function getNewsImage(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
        '--single-process',
        '--no-zygote'
      ],
      executablePath: process.env.CHROME_BIN || null
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Timeout süresini artır
    await page.setDefaultNavigationTimeout(30000);
    
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    // Görsel seçicisini güncelle
    const imageUrl = await page.evaluate(() => {
      const img = document.querySelector('.news-header img') || 
                 document.querySelector('.news-content img') ||
                 document.querySelector('img[src*="news"]');
      return img ? img.src : null;
    });
    
    return imageUrl;
  } catch (error) {
    console.error(`Haber görseli çekilirken hata: ${url}`, error.message);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Haberleri getir
app.get('/api/news', async (req, res) => {
  try {
    // Önbellekteki verileri kontrol et
    if (newsCache && lastNewsCacheUpdate && (Date.now() - lastNewsCacheUpdate < NEWS_CACHE_DURATION)) {
      return res.json(newsCache);
    }

    const response = await axios.get(`${API_BASE_URL}/news`);
    const news = response.data.data.segments;

    // Puppeteer ile her haber için görsel çek
    const enhancedNews = await Promise.all(news.map(async (item) => {
      try {
        const imageUrl = await getNewsImage(item.url_path);
        
        return {
          ...item,
          image: imageUrl || '/images/default-news.jpg'
        };
      } catch (err) {
        console.error(`Haber görseli çekilirken hata: ${item.url_path}`, err);
        return {
          ...item,
          image: '/images/default-news.jpg'
        };
      }
    }));

    // Önbelleğe al
    newsCache = enhancedNews;
    lastNewsCacheUpdate = Date.now();

    res.json(enhancedNews);
  } catch (error) {
    console.error('Haberler yüklenirken hata:', error);
    res.status(500).json({ error: 'Haberler yüklenirken bir hata oluştu.' });
  }
});

// Takım sıralamalarını getir
app.get('/api/rankings', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/rankings`);
    res.json(response.data.data.segments);
  } catch (error) {
    res.status(500).json({ error: 'Sıralamalar yüklenirken bir hata oluştu.' });
  }
});

// Canlı skorları getir (sadece skor bilgisi)
app.get('/api/matches/live-scores', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/matches/live`);
    const liveMatches = response.data.data.segments.map(match => ({
      id: match.id,
      team1: match.teams[0].name,
      team2: match.teams[1].name,
      score1: match.teams[0].score,
      score2: match.teams[1].score,
      status: match.status,
      timestamp: new Date().toISOString()
    }));
    res.json(liveMatches);
  } catch (error) {
    console.error('Canlı skorlar yüklenirken hata:', error);
    res.status(500).json({ error: 'Canlı skorlar yüklenirken bir hata oluştu.' });
  }
});

// Turnuva bilgilerini ve logolarını getir
app.get('/api/tournaments', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tournaments`);
    const tournaments = response.data.data.segments.map(tournament => ({
      id: tournament.id,
      name: tournament.name,
      logo: tournament.logo,
      startDate: tournament.start_date,
      endDate: tournament.end_date,
      status: tournament.status,
      region: tournament.region,
      prizePool: tournament.prize_pool,
      series: tournament.series
    }));
    res.json(tournaments);
  } catch (error) {
    console.error('Turnuva bilgileri yüklenirken hata:', error);
    res.status(500).json({ error: 'Turnuva bilgileri yüklenirken bir hata oluştu.' });
  }
});

// Aktif turnuvaları getir
app.get('/api/tournaments/active', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tournaments`);
    const activeTournaments = response.data.data.segments
      .filter(tournament => tournament.status === 'ongoing')
      .map(tournament => ({
        id: tournament.id,
        name: tournament.name,
        logo: tournament.logo,
        startDate: tournament.start_date,
        endDate: tournament.end_date,
        region: tournament.region,
        prizePool: tournament.prize_pool,
        series: tournament.series
      }));
    res.json(activeTournaments);
  } catch (error) {
    console.error('Aktif turnuvalar yüklenirken hata:', error);
    res.status(500).json({ error: 'Aktif turnuvalar yüklenirken bir hata oluştu.' });
  }
});

// Önbellek için değişkenler
let teamsCache = null;
let lastCacheUpdate = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

// PandaScore API'den takımları getir
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

app.get('/api/teams', async (req, res) => {
  try {
    const { page = 1, per_page = 500, game, region } = req.query;
    
    // Önbellekteki verileri kontrol et
    if (teamsCache && lastCacheUpdate && (Date.now() - lastCacheUpdate < CACHE_DURATION)) {
      let filteredTeams = [...teamsCache];
      
      // Filtreleme
      if (game && game !== 'all') {
        filteredTeams = filteredTeams.filter(team => team.game === game);
      }
      if (region && region !== 'all') {
        filteredTeams = filteredTeams.filter(team => team.region === region);
      }
      
      // Sayfalama
      const startIndex = (page - 1) * per_page;
      const endIndex = startIndex + parseInt(per_page);
      const paginatedTeams = filteredTeams.slice(startIndex, endIndex);
      
      return res.json({
        teams: paginatedTeams,
        total: filteredTeams.length,
        page: parseInt(page),
        per_page: parseInt(per_page),
        total_pages: Math.ceil(filteredTeams.length / per_page)
      });
    }

    // Önbellek yoksa veya süresi dolmuşsa yeni veri çek
    let allTeams = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `https://api.pandascore.co/valorant/teams?sort=acronym&page=${currentPage}&per_page=100`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
            authorization: 'Bearer lTYBh3FjXD5q65dZIrM1JGKloctoODFF8VtzW-2RpBgQZzg8eys'
          }
        }
      );
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        allTeams = allTeams.concat(data);
        currentPage++;
        if (data.length < 100) hasMore = false;
      } else {
        hasMore = false;
      }
    }

    // Verileri dönüştür ve önbelleğe al
    teamsCache = allTeams.map(team => ({
      id: team.id,
      name: team.name,
      logo: team.image_url,
      game: team.current_videogame?.name || 'Valorant',
      region: team.location || '-',
      ranking: team.rating || '-'
    }));
    
    lastCacheUpdate = Date.now();

    // Filtreleme
    let filteredTeams = [...teamsCache];
    if (game && game !== 'all') {
      filteredTeams = filteredTeams.filter(team => team.game === game);
    }
    if (region && region !== 'all') {
      filteredTeams = filteredTeams.filter(team => team.region === region);
    }

    // Sayfalama
    const startIndex = (page - 1) * per_page;
    const endIndex = startIndex + parseInt(per_page);
    const paginatedTeams = filteredTeams.slice(startIndex, endIndex);

    res.json({
      teams: paginatedTeams,
      total: filteredTeams.length,
      page: parseInt(page),
      per_page: parseInt(per_page),
      total_pages: Math.ceil(filteredTeams.length / per_page)
    });
  } catch (error) {
    console.error('PandaScore takımlar yüklenirken hata:', error);
    res.status(500).json({ error: 'Takımlar yüklenirken bir hata oluştu.' });
  }
});

// Takım istatistiklerini getir
app.get('/api/stats/teams', async (req, res) => {
  try {
    const { game } = req.query;
    const response = await axios.get(`${API_BASE_URL}/stats/teams`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    let stats = response.data.data.segments || [];
    
    if (game) {
      stats = stats.filter(stat => stat.game === game);
    }

    res.json(stats);
  } catch (error) {
    console.error('Takım istatistikleri yüklenirken hata:', error.message);
    res.status(500).json({ error: 'Takım istatistikleri yüklenirken bir hata oluştu.' });
  }
});

// Oyuncu istatistiklerini getir
app.get('/api/stats/players', async (req, res) => {
  try {
    const { game } = req.query;
    const response = await axios.get(`${API_BASE_URL}/stats/players`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    let stats = response.data.data.segments || [];
    
    if (game) {
      stats = stats.filter(stat => stat.game === game);
    }

    res.json(stats);
  } catch (error) {
    console.error('Oyuncu istatistikleri yüklenirken hata:', error.message);
    res.status(500).json({ error: 'Oyuncu istatistikleri yüklenirken bir hata oluştu.' });
  }
});

// Favorileri getir
app.get('/api/favorites', async (req, res) => {
  try {
    // Burada veritabanından kullanıcının favorilerini çekeceğiz
    // Şimdilik örnek veri dönüyoruz
    const favorites = [
      {
        id: 1,
        type: 'team',
        title: 'Fnatic',
        image: 'https://example.com/fnatic.png',
        game: 'League of Legends'
      }
    ];
    
    res.json(favorites);
  } catch (error) {
    console.error('Favoriler yüklenirken hata:', error);
    res.status(500).json({ error: 'Favoriler yüklenirken bir hata oluştu.' });
  }
});

// Favori takımlar ve bildirimler (memory)
let favoriteTeams = [];
let notifications = [];

// Favori ekle
app.post('/api/favorites', (req, res) => {
  const { teamId, teamName } = req.body;
  if (!favoriteTeams.find(t => t.teamId === teamId)) {
    favoriteTeams.push({ teamId, teamName });
  }
  res.json({ message: 'Favori takıma eklendi' });
});

// Bildirim ayarlarını kaydet
app.post('/api/notifications/settings', (req, res) => {
  const { teamId, settings } = req.body;
  const team = favoriteTeams.find(t => t.teamId === teamId);
  if (team) {
    team.notificationSettings = settings;
    res.json({ message: 'Bildirim ayarları kaydedildi' });
  } else {
    res.status(404).json({ error: 'Takım bulunamadı' });
  }
});

// Bildirimleri getir
app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

// Canlı maçları kontrol et ve bildirim oluştur
setInterval(async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/matches/live`);
    const liveMatches = response.data.data.segments;

    // Favori takımların canlıda olup olmadığını kontrol et
    notifications = [];
    favoriteTeams.forEach(fav => {
      const match = liveMatches.find(
        m => m.teams.some(t => t.name === fav.teamName)
      );
      
      if (match) {
        // Maç başlangıcı bildirimi
        if (fav.notificationSettings?.matchStart && !match.notifications?.matchStartSent) {
          notifications.push({
            type: 'matchStart',
            message: `Hey! Kalbimiz heyecanla atıyor! 🎮 ${fav.teamName} takımımızın maçı başlamak üzere! Hadi gel, birlikte destekleyelim! 💪`,
            team: fav.teamName,
            timestamp: new Date()
          });
          match.notifications = { ...match.notifications, matchStartSent: true };
        }

        // Skor değişikliği bildirimi
        if (fav.notificationSettings?.scoreChange && match.lastScore !== match.currentScore) {
          const scoreDiff = match.currentScore - match.lastScore;
          const emoji = scoreDiff > 0 ? '🎯' : '😢';
          const message = scoreDiff > 0 
            ? `İnanılmaz bir an! ${fav.teamName} takımımız harika bir hamle yaptı! ${emoji} Yeni skor: ${match.currentScore} - Kalbimiz gururla atıyor!`
            : `Endişelenme! ${fav.teamName} takımımız her zaman geri döner! ${emoji} Yeni skor: ${match.currentScore} - Onlara güveniyoruz!`;
          
          notifications.push({
            type: 'scoreChange',
            message: message,
            matchId: match.id,
            team: fav.teamName,
            timestamp: new Date()
          });
          match.lastScore = match.currentScore;
        }

        // Maç sonu bildirimi
        if (fav.notificationSettings?.matchEnd && match.status === 'completed' && !match.notifications?.matchEndSent) {
          const result = match.currentScore > match.opponentScore ? 'kazandı' : 'kaybetti';
          const emoji = result === 'kazandı' ? '🏆' : '💪';
          const message = result === 'kazandı'
            ? `Harika bir zafer! ${fav.teamName} takımımız inanılmaz bir performans sergiledi! ${emoji} Gurur duyuyoruz!`
            : `Cesaretiniz kırılmasın! ${fav.teamName} takımımız her zaman daha güçlü döner! ${emoji} Sizinle gurur duyuyoruz!`;
          
          notifications.push({
            type: 'matchEnd',
            message: message,
            matchId: match.id,
            team: fav.teamName,
            timestamp: new Date()
          });
          match.notifications = { ...match.notifications, matchEndSent: true };
        }
      }
    });

    // WebSocket üzerinden bildirimleri gönder
    if (notifications.length > 0) {
      io.emit('notifications', notifications);
    }
  } catch (err) {
    console.error('Bildirim kontrolü sırasında hata:', err);
  }
}, 15000);

// Events API
app.get('/api/events', (req, res) => {
    try {
        const eventsDir = path.join(__dirname, '../frontend/public/events/processed');
        console.log('Events dizini:', eventsDir);
        
        const files = fs.readdirSync(eventsDir);
        console.log('Bulunan dosyalar:', files);
        
        const events = files
            .filter(file => file.endsWith('.png') && file !== 'default-tournament-logo.png')
            .map(file => {
                const name = file.replace('.png', '');
                const event = {
                    id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    name: name,
                    logo: file,
                    date: '2025',
                    region: getRegionFromName(name)
                };
                console.log('Oluşturulan event:', event);
                return event;
            });

        console.log('Toplam event sayısı:', events.length);
        res.json(events);
    } catch (error) {
        console.error('Events API hatası:', error);
        res.status(500).json({ error: 'Events yüklenirken bir hata oluştu' });
    }
});

// İsimden bölgeyi tahmin eden yardımcı fonksiyon
function getRegionFromName(name) {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('americas') || nameLower.includes('north america') || nameLower.includes('brazil')) {
        return 'americas';
    } else if (nameLower.includes('emea') || nameLower.includes('europe') || nameLower.includes('turkey')) {
        return 'emea';
    } else if (nameLower.includes('pacific') || nameLower.includes('asia') || nameLower.includes('japan')) {
        return 'pacific';
    } else if (nameLower.includes('china')) {
        return 'china';
    }
    
    return 'other';
}

// time_completed stringini yaklaşık Date nesnesine çeviren fonksiyon
function parseTimeCompleted(str) {
  // Örnekler: "1d 3h ago", "2h 26m ago", "4d 11h ago"
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
  let days = 0, hours = 0, minutes = 0;
  const dayMatch = str.match(/(\d+)d/);
  const hourMatch = str.match(/(\d+)h/);
  const minMatch = str.match(/(\d+)m/);
  if (dayMatch) days = parseInt(dayMatch[1]);
  if (hourMatch) hours = parseInt(hourMatch[1]);
  if (minMatch) minutes = parseInt(minMatch[1]);
  // Tarihi hesapla ve saat dilimini düzelt
  const date = new Date(now.getTime() - ((days*24 + hours)*60 + minutes)*60000);
  return date;
}

// Hata yönetimi middleware'i
app.use((err, req, res, next) => {
  console.error('Sunucu hatası:', err);
  res.status(500).json({
    error: 'Sunucu hatası',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Bir hata oluştu'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'İstenen kaynak bulunamadı'
  });
});

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://esportspulse.vercel.app',
      'https://esportspulse-frontend.vercel.app'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Kullanıcı bağlantılarını yönet
io.on('connection', (socket) => {
  console.log('Bir kullanıcı bağlandı:', socket.id);
  socket.on('join', (userId) => {
    socket.join(userId);
  });
  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı:', socket.id);
  });
});

// Örnek: Maç başladığında bildirim gönder
app.post('/api/notify-match-start', (req, res) => {
  const { userId, teamName } = req.body;
  io.to(userId).emit('notification', {
    type: 'matchStart',
    title: `${teamName} maçı başlıyor!`,
    message: 'Hey! Takımının maçı başlamak üzere, başarılar!',
    timestamp: new Date(),
    read: false
  });
  res.json({ success: true });
});

// Sunucuyu başlat
server.listen(port, () => {
  console.log(`Server ${port} portunda çalışıyor`);
}); 