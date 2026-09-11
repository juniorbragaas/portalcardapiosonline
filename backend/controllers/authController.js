const service = require('../services/authService');

async function login(req, res, next) {
  try {
    const { login, password } = req.body;
    if (!login || !password) return res.status(400).json({ message: 'Login e senha são obrigatórios' });
    res.json(await service.authenticate(login, password));
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
