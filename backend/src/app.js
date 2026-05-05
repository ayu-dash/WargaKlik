const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

app.use('/api/auth', authRoutes);
app.use('/api/warga', wargaRoutes);
app.use('/api/iuran', iuranRoutes);
app.use('/api/tagihan', tagihanRoutes);
app.use('/api/pembayaran', pembayaranRoutes);
app.use('/api/kas', kasRoutes);
app.use('/api/pengumuman', pengumumanRoutes);
app.use('/api/notifikasi', notifikasiRoutes);
app.use('/api/laporan', laporanRoutes);

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
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

module.exports = app;
