const User = require('../models/User');
const generateToken = require('../utils/generateToken');
exports.register = async (req, res) => {
  try {
    console.log('Dados recebidos no register:', req.body); // ← DEBUG: veja o que chega

    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios: name, email, password, phone' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'E-mail já cadastrado.' });
    }

    console.log('Criando usuário...');
    const user = await User.create({
      name,
      email,
      password,          // será hasheado automaticamente pelo pre-save
      phone,
      role: 'client',
      profileImage: null
    });

    console.log('Usuário criado com sucesso:', user._id);

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      token
    });
  } catch (error) {
    console.error('ERRO NO REGISTER:', error); // ← Isso vai aparecer no terminal!
    res.status(500).json({
      message: 'Erro ao registrar usuário',
      error: error.message,
      stack: error.stack ? error.stack.split('\n')[0] : undefined // só a primeira linha do stack
    });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
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
    res.status(500).json({ message: 'Erro no login', error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil', error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    if (req.body.password) {
      user.password = req.body.password; // Será hasheado pelo pre-save hook
    }
    if (req.user.role === 'admin' || req.user.role === 'professional') {
      user.profileImage = req.body.profileImage || user.profileImage;
      user.specialties = req.body.specialties || user.specialties;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
      token: generateToken(updatedUser._id, updatedUser.role)
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar perfil', error: error.message });
  }
};

exports.promoteUser = async (req, res) => {
  try {
    const { userId, newRole } = req.body;
    if (!['client', 'professional', 'admin'].includes(newRole)) {
      return res.status(400).json({ message: 'Role inválida' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    
    user.role = newRole;
    await user.save();

    res.json({ message: `Usuário promovido para ${newRole}` });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao promover usuário', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar usuários', error: error.message });
  }
};