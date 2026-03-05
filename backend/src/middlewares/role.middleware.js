
/*
====================
SECAO INTERNA PADRAO
====================
*/

export const allowRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'NÃ£o autenticado' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Sem permissÃ£o' });
    }

    return next();
  };





