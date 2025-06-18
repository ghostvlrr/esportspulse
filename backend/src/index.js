const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();
const port = process.env.PORT || 3001;

// CORS yapılandırması
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204
};

// CORS middleware'ini uygula
app.use(cors(corsOptions));

// OPTIONS isteklerini özel olarak ele al
app.options('*', cors(corsOptions));

// Rate limiting yapılandırması
// const limiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1 dakika
//   max: 60, // IP başına maksimum istek sayısı
//   message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.',
//   standardHeaders: true,
//   legacyHeaders: false,
//   skipSuccessfulRequests: true // Başarılı istekleri sayma
// });

// Rate limiter'ı sadece /api/matches endpoint'ine uygula
// app.use('/api/matches', limiter);

// JSON parser
app.use(express.json());

// Test endpoint'i
app.get('/api/matches', (req, res) => {
  res.json([
    {
      id: '1',
      title: 'Test Maç 1',
      date: new Date().toISOString(),
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'Test Maç 2',
      date: new Date().toISOString(),
      status: 'live'
    }
  ]);
});

// Bildirim endpoint'i
app.get('/api/notifications', (req, res) => {
  res.json([
    {
      id: '1',
      type: 'matchStart',
      title: 'Maç Başlıyor',
      message: 'CS:GO maçı başlamak üzere!',
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      type: 'scoreChange',
      title: 'Skor Değişti',
      message: 'Valorant maçında skor değişti!',
      read: false,
      createdAt: new Date().toISOString()
    }
  ]);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 