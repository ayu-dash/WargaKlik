const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Warga, sequelize } = require('../models');
const { Op } = require('sequelize');
const { success, error } = require('../utils/response');
const { generateOtp, getOtpExpiry, isOtpExpired } = require('../utils/otp');
const mailService = require('../services/mail.service');
const waService = require('../services/whatsapp.service');

/**
 * Generate JWT tokens
 */
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
  return { accessToken, refreshToken };
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const loginId = identifier || email; // Support both for backward compatibility

    if (!loginId || !password) {
      return error(res, 'Email/Nomor Telepon dan password wajib diisi', 400);
    }

    const user = await User.findOne({ 
      where: { 
        [Op.or]: [
          { email: loginId },
          { no_telepon: loginId }
        ] 
      } 
    });

    if (!user) {
      return error(res, 'Email/Nomor Telepon atau password salah', 401);
    }

    // Check if account is locked
    if (user.lock_until && user.lock_until > new Date()) {
      const remainingMinutes = Math.ceil((user.lock_until - new Date()) / 60000);
      return error(res, `Akun Anda terkunci. Silakan coba lagi dalam ${remainingMinutes} menit.`, 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment login attempts
      user.login_attempts += 1;
      
      // Lock account if attempts >= 5
      if (user.login_attempts >= 5) {
        user.lock_until = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
      }
      
      await user.save();
      return error(res, 'Email/Nomor Telepon atau password salah', 401);
    }

    // Success - reset attempts
    user.login_attempts = 0;
    user.lock_until = null;
    await user.save();

    const tokens = generateTokens(user);

    return success(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        no_telepon: user.no_telepon
      },
      ...tokens
    }, 'Login berhasil');
  } catch (err) {
    console.error('Login error:', err);
    return error(res, 'Gagal login', 500);
  }
};

/**
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return error(res, 'Refresh token wajib diisi', 400);
    }

    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return error(res, 'User tidak ditemukan', 401);
    }

    const tokens = generateTokens(user);
    return success(res, tokens, 'Token diperbarui');
  } catch (err) {
    return error(res, 'Refresh token tidak valid', 401);
  }
};

/**
 * POST /api/auth/activate
 * Send OTP for account activation
 */
const activate = async (req, res) => {
  try {
    const { identifier, email } = req.body;
    const loginId = identifier || email;
    if (!loginId) return error(res, 'Email/Nomor Telepon wajib diisi', 400);

    const user = await User.findOne({ 
      where: { 
        [Op.or]: [
          { email: loginId },
          { no_telepon: loginId }
        ] 
      } 
    });
    if (!user) return error(res, 'User tidak ditemukan', 404);

    const otpCode = generateOtp();
    user.otp_code = otpCode;
    user.otp_expiry = getOtpExpiry();
    user.otp_attempts = 0; // Reset attempts for new code
    await user.save();

    // Send OTP via email and WhatsApp
    try { if (user.email) await mailService.sendOtp(user.email, otpCode, 'aktivasi'); } catch (e) { console.error('Mail OTP error:', e.message); }
    if (user.no_telepon) {
      try { await waService.sendOtpWA(user.no_telepon, otpCode, 'aktivasi'); } catch (e) { console.error('WA OTP error:', e.message); }
    }

    return success(res, null, 'Kode OTP telah dikirim ke email dan WhatsApp Anda');
  } catch (err) {
    console.error('Activate error:', err);
    return error(res, 'Gagal mengirim OTP', 500);
  }
};

/**
 * POST /api/auth/verify-otp
 * Verify OTP and set new password (activation)
 */
const verifyOtp = async (req, res) => {
  try {
    const { identifier, email, otp_code, password } = req.body;
    const loginId = identifier || email;
    if (!loginId || !otp_code || !password) {
      return error(res, 'Email/Nomor Telepon, kode OTP, dan password baru wajib diisi', 400);
    }

    const user = await User.findOne({ 
      where: { 
        [Op.or]: [
          { email: loginId },
          { no_telepon: loginId }
        ] 
      } 
    });
    if (!user) return error(res, 'User tidak ditemukan', 404);
    if (!user.otp_code) return error(res, 'Tidak ada permintaan OTP aktif', 400);

    // Limit to 5 attempts per OTP code
    if (user.otp_attempts >= 5) {
      user.otp_code = null;
      user.otp_expiry = null;
      user.otp_attempts = 0;
      await user.save();
      return error(res, 'Terlalu banyak percobaan yang salah. Silakan minta kode OTP baru.', 400);
    }

    if (user.otp_code !== otp_code) {
      user.otp_attempts += 1;
      await user.save();
      const remaining = 5 - user.otp_attempts;
      return error(res, `Kode OTP salah. Sisa percobaan: ${remaining}`, 400);
    }

    if (isOtpExpired(user.otp_expiry)) {
      return error(res, 'Kode OTP sudah kadaluarsa', 400);
    }

    // Set new password and clear OTP
    user.password = await bcrypt.hash(password, 10);
    user.otp_code = null;
    user.otp_expiry = null;
    user.otp_attempts = 0; // Reset attempts
    await user.save();

    const tokens = generateTokens(user);

    return success(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      ...tokens
    }, 'Akun berhasil diaktifkan');
  } catch (err) {
    console.error('Verify OTP error:', err);
    return error(res, 'Gagal verifikasi OTP', 500);
  }
};

/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { identifier, email } = req.body;
    const loginId = identifier || email;
    if (!loginId) return error(res, 'Email/Nomor Telepon wajib diisi', 400);

    const user = await User.findOne({ 
      where: { 
        [Op.or]: [
          { email: loginId },
          { no_telepon: loginId }
        ] 
      } 
    });
    if (!user) return error(res, 'User tidak ditemukan', 404);

    const otpCode = generateOtp();
    user.otp_code = otpCode;
    user.otp_expiry = getOtpExpiry();
    user.otp_attempts = 0; // Reset attempts for new code
    await user.save();

    try { if (user.email) await mailService.sendOtp(user.email, otpCode, 'reset'); } catch (e) { console.error('Mail error:', e.message); }
    if (user.no_telepon) {
      try { await waService.sendOtpWA(user.no_telepon, otpCode, 'reset'); } catch (e) { console.error('WA error:', e.message); }
    }

    return success(res, null, 'Kode OTP telah dikirim');
  } catch (err) {
    console.error('Forgot password error:', err);
    return error(res, 'Gagal mengirim OTP', 500);
  }
};

/**
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { identifier, email, otp_code, password } = req.body;
    const loginId = identifier || email;
    if (!loginId || !otp_code || !password) {
      return error(res, 'Email/Nomor Telepon, kode OTP, dan password baru wajib diisi', 400);
    }

    const user = await User.findOne({ 
      where: { 
        [Op.or]: [
          { email: loginId },
          { no_telepon: loginId }
        ] 
      } 
    });
    if (!user) return error(res, 'User tidak ditemukan', 404);

    if (user.otp_code !== otp_code) return error(res, 'Kode OTP salah', 400);
    if (isOtpExpired(user.otp_expiry)) return error(res, 'Kode OTP sudah kadaluarsa', 400);

    user.password = await bcrypt.hash(password, 10);
    user.otp_code = null;
    user.otp_expiry = null;
    await user.save();

    return success(res, null, 'Password berhasil direset');
  } catch (err) {
    console.error('Reset password error:', err);
    return error(res, 'Gagal reset password', 500);
  }
};

/**
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return error(res, 'Password lama dan baru wajib diisi', 400);
    }
    if (newPassword.length < 6) {
      return error(res, 'Password baru minimal 6 karakter', 400);
    }

    const user = await User.findByPk(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return error(res, 'Password lama salah', 400);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return success(res, null, 'Password berhasil diubah');
  } catch (err) {
    console.error('Change password error:', err);
    return error(res, 'Gagal mengubah password', 500);
  }
};

/**
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, no_telepon, email } = req.body;
    const user = await User.findByPk(req.user.id);

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return error(res, 'Email sudah digunakan oleh akun lain', 400);
      user.email = email;
    }
    if (name) user.name = name;
    if (no_telepon !== undefined) user.no_telepon = no_telepon;
    await user.save();

    // Also update warga kepala_keluarga if applicable
    if (name) {
      const warga = await Warga.findOne({ where: { user_id: user.id } });
      if (warga) {
        warga.kepala_keluarga = name;
        await warga.save();
      }
    }

    return success(res, {
      id: user.id,
      name: user.name,
      email: user.email,
      no_telepon: user.no_telepon,
      role: user.role
    }, 'Profil berhasil diperbarui');
  } catch (err) {
    console.error('Update profile error:', err);
    return error(res, 'Gagal memperbarui profil', 500);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'otp_code', 'otp_expiry'] },
      include: [{ model: Warga, as: 'warga' }]
    });
    return success(res, user);
  } catch (err) {
    return error(res, 'Gagal mengambil data user', 500);
  }
};

/**
 * POST /api/auth/validate-otp
 * Check if OTP is valid without consuming it yet
 */
const validateOtp = async (req, res) => {
  try {
    const { identifier, email, otp_code } = req.body;
    const loginId = identifier || email;
    if (!loginId || !otp_code) {
      return error(res, 'Email/Nomor Telepon dan kode OTP wajib diisi', 400);
    }

    const user = await User.findOne({ 
      where: { 
        [Op.or]: [
          { email: loginId },
          { no_telepon: loginId }
        ] 
      } 
    });
    if (!user) return error(res, 'User tidak ditemukan', 404);
    if (!user.otp_code) return error(res, 'Tidak ada permintaan OTP aktif', 400);

    // Limit to 5 attempts per OTP code
    if (user.otp_attempts >= 5) {
      user.otp_code = null;
      user.otp_expiry = null;
      user.otp_attempts = 0;
      await user.save();
      return error(res, 'Terlalu banyak percobaan yang salah. Silakan minta kode OTP baru.', 400);
    }

    if (user.otp_code !== otp_code) {
      user.otp_attempts += 1;
      await user.save();
      const remaining = 5 - user.otp_attempts;
      return error(res, `Kode OTP salah. Sisa percobaan: ${remaining}`, 400);
    }

    if (isOtpExpired(user.otp_expiry)) {
      return error(res, 'Kode OTP sudah kadaluarsa', 400);
    }

    return success(res, null, 'Kode OTP valid');
  } catch (err) {
    console.error('Validate OTP error:', err);
    return error(res, 'Gagal validasi OTP', 500);
  }
};

module.exports = { login, refreshToken, activate, verifyOtp, forgotPassword, resetPassword, changePassword, updateProfile, getMe, validateOtp };
