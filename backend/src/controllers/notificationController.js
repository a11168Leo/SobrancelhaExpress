const Notification = require('../models/Notification');

// Listar notificações do usuário logado
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar notificações', error: error.message });
  }
};

// Marcar uma notificação específica como lida
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar notificação', error: error.message });
  }
};

// Marcar todas como lidas
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipientId: req.user.id, read: false }, { read: true });
    res.status(200).json({ message: 'Todas as notificações foram marcadas como lidas.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar notificações', error: error.message });
  }
};