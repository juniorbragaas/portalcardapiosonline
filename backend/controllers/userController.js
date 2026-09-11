const service = require('../services/userService');

async function list(req, res, next) {
  try {
    res.json(await service.list());
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    res.json(await service.getById(req.params.id));
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    // aceita tanto "type" quanto "usertype" no body
    const { login, password, type, usertype } = req.body;
    res.status(201).json(await service.create({ login, password, usertype: type || usertype }));
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    // aceita tanto "type" quanto "usertype" no body
    const { login, password, type, usertype } = req.body;
    res.json(await service.update(req.params.id, { login, password, usertype: type || usertype }));
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    await service.remove(req.params.id);
    res.json({ message: 'Usuário excluído' });
  } catch (e) {
    next(e);
  }
}

module.exports = { list, getById, create, update, remove };
