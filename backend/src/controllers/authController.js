const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Função auxiliar para gerar o Token (Caso não tenha o arquivo config/auth)
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Registrar um novo usuário (Cliente, Profissional ou Admin)
 * @route   POST /api/auth/register-client OU /api/auth/register-staff
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, profileImage } = req.body;

    // 1. Verificar se o usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
    }

    // 2. Aplicar Regra de Negócio: Apenas Admin e Professional podem ter foto
    // Se for cliente, forçamos o profileImage para null
    let finalProfileImage = null;
    if (role === 'admin' || role === 'professional') {
      finalProfileImage = profileImage || null;
    }

    // 3. Criar o usuário
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'client', // Default é cliente
      profileImage: finalProfileImage
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        token: generateToken(user._id, user.role)
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
  }
};

/**
 * @desc    Autenticar usuário e obter token
 * @route   POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar usuário pelo email
    const user = await User.findOne({ email });

    // 2. Verificar se usuário existe e se a senha bate (usando o método matchPassword do Model)
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        token: generateToken(user._id, user.role)
      });
    } else {
      res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

/**
 * @desc    Obter perfil do usuário logado
 * @route   GET /api/auth/profile
 */
exports.getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage
    });
  } else {
    res.status(404).json({ message: 'Usuário não encontrado' });
  }
};