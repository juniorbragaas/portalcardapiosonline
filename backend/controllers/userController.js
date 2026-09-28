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
    const { login, password, type, usertype, id_empresa } = req.body;
    res.status(201).json(await service.create({
      login,
      password,
      usertype:   type || usertype,
      id_empresa: id_empresa || null
    }));
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const { login, password, type, usertype, id_empresa } = req.body;
    res.json(await service.update(req.params.id, {
      login,
      password,
      usertype:   type || usertype,
      id_empresa: id_empresa !== undefined ? id_empresa : undefined
    }));
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
