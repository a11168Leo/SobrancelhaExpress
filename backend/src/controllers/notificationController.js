const Notification = require('../models/Notification');

// Listar notificações não lidas do profissional
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      recipientId: req.user.id,
      read: false 
    }).sort({ createdAt: -1 }); // Mais recentes primeiro

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Marcar como lida
exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Notificação lida' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};