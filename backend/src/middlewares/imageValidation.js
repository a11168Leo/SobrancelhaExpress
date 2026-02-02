const validatePhotoAccess = (req, res, next) => {
  // O usuário que está tentando subir/alterar foto precisa ser admin ou professional
  if (req.user.role === 'client') {
    return res.status(403).json({ 
      message: "Clientes não possuem foto de perfil neste sistema." 
    });
  }
  next();
};

module.exports = { validatePhotoAccess };