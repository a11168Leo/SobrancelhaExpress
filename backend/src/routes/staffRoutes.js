const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { getMyNotifications } = require('../controllers/notificationController');

// Notificações: Exclusivo Site B
router.get('/notifications', protect, authorize('admin', 'professional'), getMyNotifications);

// Upload de Foto: Apenas Admin e Profissional podem ter
router.post('/profile-picture', protect, authorize('admin', 'professional'), upload.single('image'), (req, res) => {
  // A lógica de salvar o caminho no banco de dados pode ser feita aqui ou no controller
  res.json({ 
    message: "Foto enviada com sucesso!", 
    path: req.file.path 
  });
});

module.exports = router;