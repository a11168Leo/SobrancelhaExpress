const Service = require('../models/Service');

exports.createService = async (req, res) => {
  try {
    const { name, description, price, durationMinutes, categoryId } = req.body;

    const service = await Service.create({
      name, description, price, durationMinutes, categoryId
    });

    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Listar serviços por categoria (Filtro para o Site do Cliente)
exports.getServicesByCategory = async (req, res) => {
  try {
    const services = await Service.find({ categoryId: req.params.categoryId });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};