const jwt = require('jsonwebtoken');
const Product = require('../models/Product');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não informado' });
  }
  try {
    req.user = jwt.verify(header.substring(7), process.env.JWT_SECRET || 'secret');
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}

// Somente ADMIN
function adminOnly(req, res, next) {
  if (req.user?.usertype !== 'ADMIN') {
    return res.status(403).json({ message: 'Acesso permitido somente para administradores' });
  }
  next();
}

// ADMIN passa livre; USER passa mas com restrição de empresa aplicada nos controllers
function userOrAdmin(req, res, next) {
  const type = req.user?.usertype;
  if (type !== 'ADMIN' && type !== 'USER') {
    return res.status(403).json({ message: 'Acesso não autorizado' });
  }
  next();
}

// Garante que USER só acessa produtos da sua empresa
// ADMIN não sofre restrição
async function ownsEmpresa(req, res, next) {
  try {
    if (req.user?.usertype === 'ADMIN') return next();

    const id_empresa = req.user?.id_empresa;
    if (!id_empresa) {
      return res.status(403).json({ message: 'Usuário sem empresa vinculada' });
    }

    // Para rotas com :id (PUT, DELETE, GET /:id), verificar dono do produto
    if (req.params.id) {
      const product = await Product.findByPk(req.params.id, { attributes: ['id_empresa'] });
      if (!product) return res.status(404).json({ message: 'Produto não encontrado' });
      if (product.id_empresa !== id_empresa) {
        return res.status(403).json({ message: 'Acesso negado: produto não pertence à sua empresa' });
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authenticate, adminOnly, userOrAdmin, ownsEmpresa };
