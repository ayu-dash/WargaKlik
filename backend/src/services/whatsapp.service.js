const axios = require('axios');

const FONNTE_URL = process.env.FONNTE_BASE_URL || 'https://api.fonnte.com';
const API_KEY = process.env.FONNTE_API_KEY;

/**
 * Send WhatsApp message via Fonnte API
 */
const sendMessage = async (phoneNumber, message) => {
  if (!API_KEY) {
    console.warn('FONNTE_API_KEY not set, skipping WhatsApp message');
    return null;
  }

  try {
    const response = await axios.post(`${FONNTE_URL}/send`, {
      target: phoneNumber,
      message: message
    }, {
      headers: {
        Authorization: API_KEY
      }
    });
    return response.data;
  } catch (err) {
    console.error('WhatsApp send error:', err.message);
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
