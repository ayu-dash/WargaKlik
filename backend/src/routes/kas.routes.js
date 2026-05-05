const router = require('express').Router();
const kasController = require('../controllers/kas.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { pengurusOnly } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');

router.use(authenticate);

// Everyone can view Kas (transparency)
router.get('/', kasController.getAllKas);

// Only pengurus can add manual kas entry
router.post('/', pengurusOnly, upload.single('bukti'), kasController.createKas);

module.exports = router;
