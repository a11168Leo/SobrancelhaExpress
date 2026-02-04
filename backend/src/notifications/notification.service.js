import Notification from './notification.model.js';

// Cria notificacao
export const createNotification = (data) => {
  return Notification.create(data);
};

// Lista notificacoes de um usuario
export const listNotificationsByUser = (userId) => {
  return Notification.find({ user: userId }).sort({ createdAt: -1 });
};

// Marca notificacao como lida
export const markNotificationRead = (id) => {
  return Notification.findByIdAndUpdate(id, { read: true }, { new: true });
};

// Remove notificacao
export const deleteNotification = (id) => {
  return Notification.findByIdAndDelete(id);
};
