const User = require('../models/User');
const { generateToken } = require('../config/auth');

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, profileImage } = req.body;

    // 1. Verifica se o e-mail já existe
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'E-mail já cadastrado' });

    // 2. DIFERENCIAÇÃO DE SEGURANÇA:
    // Apenas 'admin' e 'professional' podem ter foto.
    // Se for 'client', ignoramos qualquer imagem enviada.
    let finalImage = null;
    if (role === 'admin' || role === 'professional') {
      finalImage = profileImage || "url_da_foto_padrao.png"; 
    }

    // 3. Criação do usuário com sua "etiqueta" (role)
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role, // Aqui o sistema define se é Admin, Profissional ou Cliente
      profileImage: finalImage
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      role: user.role, // Devolvemos o papel para o Frontend saber qual Dashboard mostrar
      token: generateToken(user._id, user.role)
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao registrar: ' + err.message });
  }
};