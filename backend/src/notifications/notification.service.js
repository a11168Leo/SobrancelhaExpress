/* ======================================== */
/* ARQUIVO: BACKEND/SRC/NOTIFICATIONS/NOTIFICATION.SERVICE.JS */
/* ======================================== */

// Importacoes
import Notification from './notification.model.js';

// Funcao exportada: createNotification
export const createNotification = (data) => {
  return Notification.create(data);
};

// Funcao exportada: listNotificationsByUser
export const listNotificationsByUser = (userId) => {
  return Notification.find({ user: userId }).sort({ createdAt: -1 });
};

// Funcao exportada: markNotificationRead
export const markNotificationRead = (id) => {
  return Notification.findByIdAndUpdate(id, { read: true }, { new: true });
};

// Funcao exportada: deleteNotification
export const deleteNotification = (id) => {
  return Notification.findByIdAndDelete(id);
};

