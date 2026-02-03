const express = require('express');
const router = express.Router();
const { 
    getMyNotifications, 
    markAsRead, 
    markAllAsRead 
} = require('../controllers/notificationController');

const { protect } = require('../middlewares/authMiddleware');

// Todas as rotas de notificação exigem que o usuário esteja logado
router.use(protect); 

// Listar notificações do usuário logado
router.get('/', getMyNotifications);

// Marcar todas as notificações do usuário como lidas
router.put('/read-all', markAllAsRead);

// Marcar uma notificação específica como lida
router.put('/:id/read', markAsRead);

module.exports = router;