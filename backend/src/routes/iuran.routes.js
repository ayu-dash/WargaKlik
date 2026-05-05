const router = require('express').Router();
const iuranController = require('../controllers/iuran.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { pengurusOnly } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', iuranController.getAllIuran);
router.post('/', pengurusOnly, iuranController.createIuran);
router.put('/:id', pengurusOnly, iuranController.updateIuran);

module.exports = router;
