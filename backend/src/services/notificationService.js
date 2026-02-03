const Notification = require('../models/Notification');

/**
 * Cria uma notificação no banco de dados
 */
const createNotification = async (recipientId, title, message, type = 'info') => {
  try {
    const notification = await Notification.create({
      recipientId,
      title,
      message,
      type, // 'appointment', 'reminder', 'system'
      read: false
    });
    return notification;
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
  }
};

module.exports = { createNotification };