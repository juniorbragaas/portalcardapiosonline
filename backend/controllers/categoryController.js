const service = require('../services/categoryService');

async function list(req, res, next) {
  try {
    const id_empresa = req.user?.usertype === 'USER' ? req.user.id_empresa : req.query.id_empresa;
    res.json(await service.list(id_empresa));
  } catch (e) { next(e); }
}

async function getById(req, res, next) {
  try { res.json(await service.getById(req.params.id)); } catch (e) { next(e); }
}

async function create(req, res, next) {
  try { res.status(201).json(await service.create(req.body)); } catch (e) { next(e); }
}

async function update(req, res, next) {
  try { res.json(await service.update(req.params.id, req.body)); } catch (e) { next(e); }
}

async function remove(req, res, next) {
  try { await service.remove(req.params.id); res.json({ message: 'Categoria excluída' }); } catch (e) { next(e); }
}

module.exports = { list, getById, create, update, remove };