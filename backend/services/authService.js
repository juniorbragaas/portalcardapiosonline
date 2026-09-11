const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repository = require('../repositories/userRepository');

async function authenticate(login, password) {
  const user = await repository.findByLogin(login);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    const error = new Error('Login ou senha inválidos');
    error.status = 401;
    throw error;
  }

  const payload = { id: user.id, login: user.login, usertype: user.usertype };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });

  return {
    token,
    user: {
      id: user.id,
      login: user.login,
      type: user.usertype,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  };
}

module.exports = { authenticate };
