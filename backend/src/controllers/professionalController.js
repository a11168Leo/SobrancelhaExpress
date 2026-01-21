const Professional = require("../models/Professional");

exports.createProfessional = async (req, res) => {
  try {
    const professional = await Professional.create({
      user: req.user._id
    });
    res.status(201).json(professional);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
