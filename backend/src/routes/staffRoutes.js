const express = require('express');
const router = express.Router();

// Importações
const { getMyNotifications } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // <-- VERIFIQUE ESTA LINHA

router.get('/notifications', protect, authorize('admin', 'professional'), getMyNotifications);

router.post('/profile-picture', protect, authorize('admin', 'professional'), upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Nenhuma foto enviada' });
  res.json({ message: 'Upload feito!', path: req.file.path });
});

module.exports = router;