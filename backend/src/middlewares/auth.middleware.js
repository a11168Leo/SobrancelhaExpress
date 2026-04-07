/* ======================================== */
/* ARQUIVO: BACKEND/SRC/MIDDLEWARES/AUTH.MIDDLEWARE.JS */
/* ======================================== */

// Importacoes
import jwt from 'jsonwebtoken';

// Funcao exportada: authMiddleware
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token nÃ£o fornecido' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
      mustChangePassword: Boolean(decoded.mustChangePassword)
    };

    const isAllowedPasswordUpdateRoute =
      req.method === 'PATCH' && req.originalUrl.includes('/api/auth/me/password');
    const isAllowedMeRoute =
      req.method === 'GET' && req.originalUrl.includes('/api/auth/me');

    if (req.user.mustChangePassword && !isAllowedPasswordUpdateRoute && !isAllowedMeRoute) {
      return res.status(403).json({
        message: 'Troca de senha obrigatoria antes de continuar',
        code: 'PASSWORD_CHANGE_REQUIRED'
      });
    }

    next();
  } catch {
    res.status(401).json({ message: 'Token invÃ¡lido' });
  }
};

