import Financial from './financial.model.js';

// Relatorio por periodo (admin)
export const reportByPeriod = async (startDate, endDate, professionalId) => {
  const filters = { createdAt: { $gte: startDate, $lte: endDate } };
  if (professionalId) {
    filters.professional = professionalId;
  }

  const items = await Financial.find(filters).sort({ createdAt: -1 });
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return { items, total };
};
