const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const { body } = require('express-validator');
const { validate } = require('../middlewares/validate.middleware');

const loginValidation = [
  body('identifier').optional().notEmpty().withMessage('Email/Nomor Telepon wajib diisi'),
  body('email').optional().isEmail().withMessage('Format email tidak valid'),
  body('password').notEmpty().withMessage('Password wajib diisi'),
  validate
];

const otpValidation = [
  body('identifier').optional().notEmpty().withMessage('Email/Nomor Telepon wajib diisi'),
  body('email').optional().isEmail().withMessage('Format email tidak valid'),
  body('otp_code').isLength({ min: 6, max: 6 }).withMessage('Kode OTP harus 6 digit'),
  validate
];

const resetPasswordValidation = [
  ...otpValidation,
  body('password').isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter'),
  validate
];

router.post('/login', loginValidation, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/activate', authController.activate);
router.post('/verify-otp', resetPasswordValidation, authController.verifyOtp);
router.post('/validate-otp', otpValidation, authController.validateOtp);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);
router.get('/me', authenticate, authController.getMe);
router.put('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Password lama wajib diisi'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter'),
  validate
], authController.changePassword);
router.put('/profile', authenticate, [
  body('name').optional().notEmpty().withMessage('Nama tidak boleh kosong'),
  body('email').optional().isEmail().withMessage('Format email tidak valid'),
  validate
], authController.updateProfile);

module.exports = router;
