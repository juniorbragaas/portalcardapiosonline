const service = require('../services/productService');

async function list(req, res, next) {
  try {
    // Filtra por empresa se passar ?id_empresa=X
    if (req.query.id_empresa) {
      return res.json(await service.listByEmpresa(req.query.id_empresa));
    }
    res.json(await service.list());
  } catch (e) { next(e); }
}

async function getById(req, res, next) {
  try {
    res.json(await service.getById(req.params.id));
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    // req.file = arquivo único enviado pelo campo "foto_produto"
    res.status(201).json(await service.create(req.body, req.file));
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    res.json(await service.update(req.params.id, req.body, req.file));
  } catch (e) { next(e); }
}

async function remove(req, res, next) {
  try {
    await service.remove(req.params.id);
    res.json({ message: 'Produto excluído' });
  } catch (e) { next(e); }
}

module.exports = { list, getById, create, update, remove };
