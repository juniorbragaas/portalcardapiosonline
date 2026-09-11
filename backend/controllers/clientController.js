const service = require('../services/clientService');

async function list(req, res, next) {
  try {
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
    res.status(201).json(await service.create(req.body, req.files));
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    res.json(await service.update(req.params.id, req.body, req.files));
  } catch (e) { next(e); }
}

async function remove(req, res, next) {
  try {
    await service.remove(req.params.id);
    res.json({ message: 'Cliente excluído' });
  } catch (e) { next(e); }
}

async function dashboard(req, res, next) {
  try {
    res.json(await service.dashboard());
  } catch (e) { next(e); }
}

module.exports = { list, getById, create, update, remove, dashboard };
