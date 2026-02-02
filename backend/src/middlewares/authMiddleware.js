const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Coloca os dados do usuário no objeto 'req' para os próximos controllers usarem
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Não autorizado, token inválido' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Acesso negado, nenhum token fornecido' });
  }
};

module.exports = { protect };