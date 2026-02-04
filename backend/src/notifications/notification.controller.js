import Notification from './notification.model.js';
import {
  createNotification,
  listNotificationsByUser,
  markNotificationRead,
  deleteNotification
} from './notification.service.js';

// Cria notificacao (admin)
export const create = async (req, res) => {
  try {
    const { userId, title, message } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({ message: 'userId, title e message sao obrigatorios' });
    }

    const notification = await createNotification({
      user: userId,
      title,
      message
    });

    res.status(201).json({ notification });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar notificacao' });
  }
};

// Lista notificacoes do usuario autenticado
export const listMine = async (req, res) => {
  try {
    const notifications = await listNotificationsByUser(req.user.id);
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar notificacoes' });
  }
};

// Marca notificacao como lida (somente dono)
export const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Notification.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Notificacao nao encontrada' });
    }
    if (String(existing.user) !== req.user.id) {
      return res.status(403).json({ message: 'Sem permissao' });
    }

    const updated = await markNotificationRead(id);
    if (!updated) {
      return res.status(404).json({ message: 'Notificacao nao encontrada' });
    }
    res.json({ notification: updated });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar notificacao' });
  }
};

// Remove notificacao (somente dono)
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Notification.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Notificacao nao encontrada' });
    }
    if (String(existing.user) !== req.user.id) {
      return res.status(403).json({ message: 'Sem permissao' });
    }

    const deleted = await deleteNotification(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Notificacao nao encontrada' });
    }
    res.json({ message: 'Notificacao removida' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover notificacao' });
  }
};
