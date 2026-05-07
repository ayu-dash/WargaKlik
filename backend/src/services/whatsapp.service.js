const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Initialize WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './.wwebjs_auth'
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one element is also important
      '--disable-gpu'
    ],
  }
});

let isReady = false;

client.on('qr', (qr) => {
  console.log('--- SCAN QR CODE BELOW TO LOGIN ---');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp Client is ready!');
  isReady = true;
});

client.on('authenticated', () => {
  console.log('✅ WhatsApp Authenticated');
});

client.on('auth_failure', (msg) => {
  console.error('❌ WhatsApp Auth Failure:', msg);
});

client.on('disconnected', (reason) => {
  console.log('❌ WhatsApp Disconnected:', reason);
  isReady = false;
  // Re-initialize
  client.initialize();
});

// Start initialization
client.initialize().catch(err => {
  console.error('❌ Failed to initialize WhatsApp client:', err);
});

/**
 * Format phone number to WhatsApp ID format
 */
const formatPhone = (phone) => {
  let formatted = phone.replace(/\D/g, '');
  if (formatted.startsWith('0')) {
    formatted = '62' + formatted.slice(1);
  }
  if (!formatted.endsWith('@c.us')) {
    formatted += '@c.us';
  }
  return formatted;
};

/**
 * Send WhatsApp message
 */
const sendMessage = async (phoneNumber, message) => {
  if (!isReady) {
    console.warn('⚠️ WhatsApp Client is not ready yet. Message queued or skipped.');
    // In a real app, you might want to queue this or retry
    return null;
  }

  try {
    const chatId = formatPhone(phoneNumber);
    const response = await client.sendMessage(chatId, message);
    return response;
  } catch (err) {
    console.error('❌ WhatsApp send error:', err.message);
    return null;
  }
};

/**
 * Send OTP via WhatsApp
 */
const sendOtpWA = async (phone, otpCode, purpose = 'aktivasi') => {
  const msg = purpose === 'aktivasi'
    ? `*Iuran RT - Aktivasi Akun*\n\nKode OTP Anda: *${otpCode}*\nBerlaku 10 menit.\n\nJangan bagikan kode ini kepada siapapun.`
    : `*Iuran RT - Reset Password*\n\nKode OTP Anda: *${otpCode}*\nBerlaku 10 menit.\n\nJangan bagikan kode ini kepada siapapun.`;
  return sendMessage(phone, msg);
};

/**
 * Send payment confirmation via WhatsApp
 */
const sendPaymentConfirmationWA = async (phone, data) => {
  const msg = `*Iuran RT - Pembayaran Berhasil ✅*\n\nTagihan: ${data.bulan}/${data.tahun}\nJumlah: Rp ${Number(data.jumlah).toLocaleString('id-ID')}\nMetode: ${data.metode}\nTanggal: ${data.tanggal}\n\nTerima kasih!`;
  return sendMessage(phone, msg);
};

/**
 * Send reminder via WhatsApp
 */
const sendReminderWA = async (phone, data) => {
  const msg = `*Iuran RT - Pengingat Tagihan ⚠️*\n\nTagihan iuran bulan ${data.bulan}/${data.tahun} sebesar *Rp ${Number(data.total).toLocaleString('id-ID')}* belum dibayar.\n\nSilakan segera lakukan pembayaran melalui:\n${process.env.FRONTEND_URL}/dashboard/tagihan`;
  return sendMessage(phone, msg);
};

module.exports = { sendMessage, sendOtpWA, sendPaymentConfirmationWA, sendReminderWA };
