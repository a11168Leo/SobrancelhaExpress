import Settings from './settings.model.js';

// Busca ou cria configuracao de horario
export const getBusinessHours = async (_req, res) => {
  try {
    const settings = await Settings.findOne({ key: 'businessHours' });
    if (!settings) {
      return res.json({ startTime: '09:00', endTime: '19:00' });
    }
    res.json(settings.data);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar configurações' });
  }
};

// Salva configuracao de horario (admin)
export const updateBusinessHours = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({ message: 'startTime e endTime são obrigatórios' });
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
    res.status(500).json({ message: 'Erro ao salvar configurações' });
  }
};
