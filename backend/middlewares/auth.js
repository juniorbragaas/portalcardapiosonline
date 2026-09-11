const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não informado' });
  }

  const token = header.substring(7);

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.usertype !== 'ADMIN') {
    return res.status(403).json({ message: 'Acesso permitido somente para administradores' });
  }
  next();
}

module.exports = { authenticate, adminOnly };
