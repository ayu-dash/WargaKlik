const router = require('express').Router();
const laporanController = require('../controllers/laporan.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { pengurusOnly, rtOnly } = require('../middlewares/role.middleware');

router.use(authenticate);

// Everyone can view reports (warga only sees approved ones, logic handled in controller)
router.get('/', laporanController.getAllLaporan);

// Pengurus (Bendahara/Sekretaris/RT) can generate
router.post('/generate', pengurusOnly, laporanController.generateLaporan);

// Pengurus can delete their drafts
router.delete('/:id', pengurusOnly, laporanController.deleteLaporan);

// ONLY RT/Wakil RT can approve
router.put('/:id/approve', rtOnly, laporanController.approveLaporan);

module.exports = router;
