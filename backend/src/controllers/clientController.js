const Client = require("../models/Client");

exports.createClient = async (req, res) => {
  const client = await Client.create(req.body);
  res.status(201).json(client);
};

exports.getClients = async (req, res) => {
  const clients = await Client.find({ professional: req.params.professionalId });
  res.json(clients);
};
