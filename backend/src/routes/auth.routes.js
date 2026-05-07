const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/activate', authController.activate);
router.post('/verify-otp', authController.verifyOtp);
router.post('/validate-otp', authController.validateOtp);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', authenticate, authController.getMe);
router.put('/change-password', authenticate, authController.changePassword);
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router;
