const bcrypt = require('bcryptjs');
const repository = require('../repositories/userRepository');

// Formata a saída do usuário usando "type" conforme solicitado
function format(user) {
  return {
    id: user.id,
    login: user.login,
    type: user.usertype,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

async function list() {
  const users = await repository.findAll();
  return users.map(format);
}

async function getById(id) {
  const user = await repository.findById(id);
  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    throw error;
  }
  return format(user);
}

async function create({ login, password, usertype = 'USER' }) {
  if (!login || !password) {
    const error = new Error('Login e senha são obrigatórios');
    error.status = 400;
    throw error;
  }

  const validTypes = ['ADMIN', 'USER'];
  if (usertype && !validTypes.includes(usertype)) {
    const error = new Error(`Tipo inválido. Use: ${validTypes.join(', ')}`);
    error.status = 400;
    throw error;
  }

  if (await repository.findByLogin(login)) {
    const error = new Error('Login já cadastrado');
    error.status = 409;
    throw error;
  }

  const user = await repository.create({
    login,
    password: await bcrypt.hash(password, 10),
    usertype: usertype || 'USER'
  });

  return format(user);
}

async function update(id, data) {
  const user = await repository.findById(id);
  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    throw error;
  }

  if (data.login && data.login !== user.login) {
    const exists = await repository.findByLogin(data.login);
    if (exists) {
      const error = new Error('Login já cadastrado');
      error.status = 409;
      throw error;
    }
    user.login = data.login;
  }

  if (data.usertype) {
    const validTypes = ['ADMIN', 'USER'];
    if (!validTypes.includes(data.usertype)) {
      const error = new Error(`Tipo inválido. Use: ${validTypes.join(', ')}`);
      error.status = 400;
      throw error;
    }
    user.usertype = data.usertype;
  }

  if (data.password) {
    user.password = await bcrypt.hash(data.password, 10);
  }

  await repository.save(user);
  return format(user);
}

async function remove(id) {
  const user = await repository.findById(id);
  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    throw error;
  }
  await repository.remove(user);
}

module.exports = { list, getById, create, update, remove };
