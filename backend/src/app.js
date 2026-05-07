const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", env.frontendUrl, "https://api.midtrans.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Global Rate Limiting
const isTest = process.env.NODE_ENV === 'test';
const globalLimiter = isTest ? (req, res, next) => next() : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// Specific limiter for Auth (Brute-force protection)
const authLimiter = isTest ? (req, res, next) => next() : rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 attempts per 15 minutes
  message: { success: false, message: 'Terlalu banyak percobaan akses, silakan coba lagi dalam 15 menit.' }
});

// CORS
app.use(cors({
  origin: env.frontendUrl,
  credentials: true
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
const authRoutes = require('./routes/auth.routes');
const wargaRoutes = require('./routes/warga.routes');
const iuranRoutes = require('./routes/iuran.routes');
const tagihanRoutes = require('./routes/tagihan.routes');
const pembayaranRoutes = require('./routes/pembayaran.routes');
const kasRoutes = require('./routes/kas.routes');
const pengumumanRoutes = require('./routes/pengumuman.routes');
const notifikasiRoutes = require('./routes/notifikasi.routes');
const laporanRoutes = require('./routes/laporan.routes');
const wargaIuranRoutes = require('./routes/wargaIuran.routes');

// Apply auth limiter to auth routes
app.use('/api/auth', authLimiter, authRoutes);

app.use('/api/warga', wargaRoutes);
app.use('/api/iuran', iuranRoutes);
app.use('/api/tagihan', tagihanRoutes);
app.use('/api/pembayaran', pembayaranRoutes);
app.use('/api/kas', kasRoutes);
app.use('/api/pengumuman', pengumumanRoutes);
app.use('/api/notifikasi', notifikasiRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/warga-iuran', wargaIuranRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// Global error handler
app.use((err, req, res, next) => {
  // Log full error internally
  console.error(`[${new Date().toISOString()}] Error ${err.status || 500}:`, err.stack);
  
  // Return generic message in production
  const isDev = process.env.NODE_ENV === 'development';
  res.status(err.status || 500).json({
    success: false,
    message: isDev ? err.message : 'Terjadi kesalahan pada server. Silakan hubungi admin.',
    ...(isDev && { stack: err.stack })
  });
});

module.exports = app;
