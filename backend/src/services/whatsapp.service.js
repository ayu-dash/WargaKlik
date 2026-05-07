const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    console.log('⏳ Initializing WhatsApp Client (Puppeteer)...');

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'iuran-rt-main',
        dataPath: path.resolve(__dirname, '../../.wwebjs_auth')
      }),
      // Mencoba menggunakan versi default

      puppeteer: {
        headless: true,
        executablePath: '/usr/bin/google-chrome-stable',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
      }
    });

    this.client.on('qr', (qr) => {
      console.log('--- SCAN QR CODE ---');
      // Menulis ke file yang di-ignore oleh nodemon
      fs.writeFileSync(path.resolve(__dirname, '../../qr.txt'), qr);
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      console.log('✅ WhatsApp Client is READY!');
      this.isReady = true;
    });

    this.client.on('disconnected', (reason) => {
      console.warn('❌ WhatsApp Client was disconnected:', reason);
      this.isReady = false;
      this.isInitialized = false;
      // Jangan langsung retry jika sering crash
      setTimeout(() => this.init(), 10000);
    });

    this.client.initialize().catch(err => {
      console.error('❌ Failed to initialize WhatsApp client:', err.message);
      this.isInitialized = false;
    });
  }

  async sendMessage(phoneNumber, message) {
    if (!this.isReady) {
      console.warn(`⚠️ WhatsApp not ready. Nomor: ${phoneNumber}`);
      return false;
    }

    try {
      let formattedNumber = phoneNumber.trim().replace(/\D/g, '');
      if (formattedNumber.startsWith('0')) formattedNumber = '62' + formattedNumber.substring(1);
      if (!formattedNumber.startsWith('62')) formattedNumber = '62' + formattedNumber;
      if (!formattedNumber.endsWith('@c.us')) formattedNumber += '@c.us';

      await this.client.sendMessage(formattedNumber, message);
      console.log(`✅ Message sent to ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error(`❌ Send error: ${error.message}`);
      return false;
    }
  }

  async sendOtpWA(phone, otpCode, purpose = 'aktivasi') {
    const action = purpose === 'aktivasi' ? 'Aktivasi Akun' : 'Reset Password';
    const msg = `*[IURAN RT - KEAMANAN AKUN]*\n\nyth. Bapak/Ibu,\nBerikut adalah Kode OTP Anda untuk proses *${action}*:\n\n*${otpCode}*\n\n *PENTING:*\n- Kode ini hanya berlaku selama 10 menit.\n- Demi keamanan, *JANGAN* memberikan kode ini kepada siapapun, termasuk pihak pengurus RT.\n- Jika Anda tidak merasa melakukan permintaan ini, harap abaikan pesan ini.\n\nTerima kasih,\nSistem Iuran RT`;
    return this.sendMessage(phone, msg);
  }
}

const waService = new WhatsAppService();
module.exports = waService;
