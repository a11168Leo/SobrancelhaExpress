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

// Compara dois periodos (admin)
export const compareByPeriod = async (
  startA,
  endA,
  startB,
  endB,
  professionalId
) => {
  const reportA = await reportByPeriod(startA, endA, professionalId);
  const reportB = await reportByPeriod(startB, endB, professionalId);

  const difference = reportA.total - reportB.total;
  const percent =
    reportB.total === 0 ? null : Number(((difference / reportB.total) * 100).toFixed(2));

  return {
    periodA: reportA,
    periodB: reportB,
    difference,
    percent
  };
};
