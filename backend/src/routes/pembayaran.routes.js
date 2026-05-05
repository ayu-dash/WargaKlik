const router = require('express').Router();
const pembayaranController = require('../controllers/pembayaran.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { pengurusOnly } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');

// Public webhook
router.post('/midtrans/webhook', pembayaranController.midtransWebhook);

router.use(authenticate);

router.get('/', pembayaranController.getAllPembayaran);
router.post('/midtrans/snap', pembayaranController.createMidtransTransaction);
router.post('/manual', pengurusOnly, upload.single('bukti'), pembayaranController.createManualPayment);

module.exports = router;
