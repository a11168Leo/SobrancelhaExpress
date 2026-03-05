
/*
====================
SECAO INTERNA PADRAO
====================
*/

import jwt from 'jsonwebtoken';




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
      email: decoded.email
    };

    next();
  } catch {
    res.status(401).json({ message: 'Token invÃ¡lido' });
  }
};





