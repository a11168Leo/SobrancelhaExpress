/* ======================================== */
/* ARQUIVO: BACKEND/SRC/SETTINGS/SETTINGS.CONTROLLER.JS */
/* ======================================== */

// Importacoes
import Settings from './settings.model.js';

// Funcao exportada: getBusinessHours
export const getBusinessHours = async (_req, res) => {
  try {
    const settings = await Settings.findOne({ key: 'businessHours' });
    if (!settings) {
      return res.json({ startTime: '09:00', endTime: '19:00' });
    }
    res.json(settings.data);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar configuracoes' });
  }
};

// Funcao exportada: updateBusinessHours
export const updateBusinessHours = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({ message: 'startTime e endTime sao obrigatorios' });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ message: 'startTime deve ser menor que endTime' });
    }

    const data = { startTime, endTime };
    const updated = await Settings.findOneAndUpdate(
      { key: 'businessHours' },
      { key: 'businessHours', data },
      { upsert: true, new: true }
    );

    res.json(updated.data);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao salvar configuracoes' });
  }
};

// Funcao exportada: getInstagramPosts
export const getInstagramPosts = async (_req, res) => {
  try {
    const settings = await Settings.findOne({ key: 'instagramPosts' });
    res.json({ posts: settings?.data?.posts || [] });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar posts do Instagram' });
  }
};

// Funcao exportada: updateInstagramPosts
export const updateInstagramPosts = async (req, res) => {
  try {
    const { posts } = req.body;
    if (!Array.isArray(posts)) {
      return res.status(400).json({ message: 'posts deve ser um array de URLs' });
    }
    const sanitized = posts
      .map(u => String(u).trim())
      .filter(u => u.includes('instagram.com'));

    const updated = await Settings.findOneAndUpdate(
      { key: 'instagramPosts' },
      { key: 'instagramPosts', data: { posts: sanitized } },
      { upsert: true, new: true }
    );
    res.json({ posts: updated.data.posts });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao salvar posts do Instagram' });
  }
};
