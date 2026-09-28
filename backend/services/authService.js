const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repository = require('../repositories/userRepository');
const clientRepository = require('../repositories/clientRepository');
const { serialize: serializeClient } = require('./clientService');

async function authenticate(login, password) {
  const user = await repository.findByLogin(login);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    const error = new Error('Login ou senha inválidos');
    error.status = 401;
    throw error;
  }

  // Para USER: resolve a empresa pelo alias === login (ou pelo id_empresa cadastrado)
  let empresa = null;
  let id_empresa_resolvido = user.id_empresa ?? null;

  if (user.usertype === 'USER') {
    const found = await clientRepository.findByAlias(user.login);
    if (found) {
      empresa = serializeClient(found);
      id_empresa_resolvido = found.id;   // ← usa o id da empresa encontrada pelo alias
    } else if (user.id_empresa) {
      const fallback = await clientRepository.findById(user.id_empresa);
      if (fallback) {
        empresa = serializeClient(fallback);
        id_empresa_resolvido = fallback.id;
      }
    }
  }

  // JWT gerado com o id_empresa já resolvido
  const payload = {
    id:         user.id,
    login:      user.login,
    usertype:   user.usertype,
    id_empresa: id_empresa_resolvido
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });

  return {
    token,
    user: {
      id:         user.id,
      login:      user.login,
      type:       user.usertype,
      id_empresa: id_empresa_resolvido,
      createdAt:  user.createdAt,
      updatedAt:  user.updatedAt
    },
    empresa
  };
}

module.exports = { authenticate };
