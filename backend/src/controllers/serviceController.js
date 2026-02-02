const Service = require('../models/Service');

// @desc    Listar todos os serviços
// @route   GET /api/services
exports.getServices = async (req, res) => {
    try {
        const services = await Service.find().populate('categoryId');
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar serviços", error: error.message });
    }
};

// @desc    Criar um novo serviço
// @route   POST /api/services
exports.createService = async (req, res) => {
    try {
        const { name, description, price, durationMinutes, categoryId } = req.body;
        
        const service = await Service.create({
            name,
            description,
            price,
            durationMinutes,
            categoryId
        });

        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ message: "Erro ao criar serviço", error: error.message });
    }
};