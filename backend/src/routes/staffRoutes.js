const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Exemplo: Rota para upload de foto de perfil (apenas staff/admin)
router.post('/profile-picture', protect, authorize('admin', 'professional'), upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Nenhuma imagem enviada.' });
  res.json({ message: 'Foto de perfil atualizada!', path: req.file.path });
});

module.exports = router;