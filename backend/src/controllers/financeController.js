const Finance = require("../models/Finance");

exports.getDashboardFinance = async (req, res) => {
  const data = await Finance.find({ professional: req.params.professionalId });

  const total = data.reduce((sum, f) => sum + f.amount, 0);

  res.json({
    receitaTotal: total,
    atendimentos: data.length,
    ticketMedio: data.length ? total / data.length : 0
  });
};
