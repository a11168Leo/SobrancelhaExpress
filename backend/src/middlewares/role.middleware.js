/* ======================================== */
/* ARQUIVO: BACKEND/SRC/MIDDLEWARES/ROLE.MIDDLEWARE.JS */
/* ======================================== */

// Funcao exportada: allowRoles
export const allowRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Nao autenticado' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Sem permissao' });
    }

    return next();
  };

