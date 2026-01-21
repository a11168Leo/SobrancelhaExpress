const Service = require("../models/Service");

exports.createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getServices = async (req, res) => {
  const services = await Service.find({ professional: req.params.professionalId });
  res.json(services);
};
