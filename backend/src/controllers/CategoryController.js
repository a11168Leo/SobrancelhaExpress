const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
  try {
    const { name, parentId, level } = req.body;

    // Se for Subcategoria, verificamos se o Pai existe
    if (parentId) {
      const parentExists = await Category.findById(parentId);
      if (!parentExists) return res.status(404).json({ message: 'Categoria pai não encontrada' });
    }

    const category = await Category.create({ name, parentId, level });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Listar todas com a hierarquia populada
exports.getCategories = async (req, res) => {
  try {
    // Traz a categoria e "popula" quem é o pai dela
    const categories = await Category.find().populate('parentId', 'name');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};