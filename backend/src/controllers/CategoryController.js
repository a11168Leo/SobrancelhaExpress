const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
  try {
    const { name, parentId, level } = req.body;
    const category = await Category.create({ name, parentId, level });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('parentId', 'name');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};