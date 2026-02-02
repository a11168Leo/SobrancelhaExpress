const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Acesso proibido para o seu perfil (${req.user.role})` 
      });
    }
    next();
  };
};

module.exports = { authorize };