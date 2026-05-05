const transporter = require('../config/mail');

const FROM_EMAIL = process.env.MAIL_USER;
const APP_NAME = 'Iuran RT';

/**
 * Send OTP via email
 */
const sendOtp = async (email, otpCode, purpose = 'aktivasi') => {
  const subject = purpose === 'aktivasi'
    ? `${APP_NAME} - Kode Aktivasi Akun`
    : `${APP_NAME} - Kode Reset Password`;

  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #1e293b; color: #f1f5f9; border-radius: 16px;">
      <h2 style="color: #10b981; margin-bottom: 8px;">${APP_NAME}</h2>
      <p style="color: #94a3b8; margin-bottom: 24px;">
        ${purpose === 'aktivasi' ? 'Gunakan kode berikut untuk mengaktifkan akun Anda:' : 'Gunakan kode berikut untuk mereset password Anda:'}
      </p>
      <div style="background: #0f172a; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #10b981;">${otpCode}</span>
      </div>
      <p style="color: #94a3b8; font-size: 14px;">Kode ini berlaku selama <strong>10 menit</strong>.</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 24px;">Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${APP_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject,
    html
  });
};

/**
 * Send payment confirmation email
 */
const sendPaymentConfirmation = async (email, paymentData) => {
  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #1e293b; color: #f1f5f9; border-radius: 16px;">
      <h2 style="color: #10b981;">${APP_NAME}</h2>
      <h3 style="color: #f1f5f9;">Pembayaran Berhasil ✅</h3>
      <div style="background: #0f172a; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
        <p style="margin: 4px 0; color: #94a3b8;">Tagihan: <strong style="color: #f1f5f9;">${paymentData.bulan}/${paymentData.tahun}</strong></p>
        <p style="margin: 4px 0; color: #94a3b8;">Jumlah: <strong style="color: #10b981;">Rp ${Number(paymentData.jumlah).toLocaleString('id-ID')}</strong></p>
        <p style="margin: 4px 0; color: #94a3b8;">Metode: <strong style="color: #f1f5f9;">${paymentData.metode}</strong></p>
        <p style="margin: 4px 0; color: #94a3b8;">Tanggal: <strong style="color: #f1f5f9;">${paymentData.tanggal}</strong></p>
      </div>
      <p style="color: #64748b; font-size: 12px;">Terima kasih atas pembayaran Anda.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${APP_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: `${APP_NAME} - Pembayaran Berhasil`,
    html
  });
};

/**
 * Send reminder email
 */
const sendReminder = async (email, reminderData) => {
  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #1e293b; color: #f1f5f9; border-radius: 16px;">
      <h2 style="color: #f59e0b;">${APP_NAME} - Pengingat</h2>
      <p style="color: #94a3b8;">Tagihan iuran bulan <strong style="color: #f1f5f9;">${reminderData.bulan}/${reminderData.tahun}</strong> sebesar:</p>
      <div style="background: #0f172a; padding: 20px; border-radius: 12px; text-align: center; margin: 16px 0;">
        <span style="font-size: 24px; font-weight: 700; color: #f59e0b;">Rp ${Number(reminderData.total).toLocaleString('id-ID')}</span>
      </div>
      <p style="color: #94a3b8;">belum dibayar. Silakan segera lakukan pembayaran.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard/tagihan" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">Bayar Sekarang</a>
    </div>
  `;

  await transporter.sendMail({
    from: `"${APP_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: `${APP_NAME} - Pengingat Tagihan Iuran`,
    html
  });
};

module.exports = { sendOtp, sendPaymentConfirmation, sendReminder };
