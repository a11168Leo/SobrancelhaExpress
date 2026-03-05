
/*
====================
SECAO INTERNA PADRAO
====================
*/

import Notification from './notification.model.js';




export const createNotification = (data) => {
  return Notification.create(data);
};




export const listNotificationsByUser = (userId) => {
  return Notification.find({ user: userId }).sort({ createdAt: -1 });
};




export const markNotificationRead = (id) => {
  return Notification.findByIdAndUpdate(id, { read: true }, { new: true });
};




export const deleteNotification = (id) => {
  return Notification.findByIdAndDelete(id);
};





