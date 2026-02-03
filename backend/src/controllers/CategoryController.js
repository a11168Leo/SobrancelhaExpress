const Category = require('../models/Category');

// @desc    Criar uma nova categoria
exports.createCategory = async (req, res) => {
    try {
        const { name, description, parentId } = req.body;
        const category = await Category.create({ name, description, parentId });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: "Erro ao criar categoria", error: error.message });
    }
};

// @desc    Listar todas as categorias
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate('parentId');
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar categorias", error: error.message });
    }
};

// @desc    Buscar uma categoria específica (A função que estava faltando!)
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).populate('parentId');
        if (!category) return res.status(404).json({ message: "Categoria não encontrada" });
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar categoria", error: error.message });
    }
};