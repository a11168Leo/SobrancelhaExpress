// Middleware para restringir acesso por papel (role)
export const allowRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Sem permissão' });
    }

    return next();
  };
