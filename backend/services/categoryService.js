const repository = require('../repositories/categoryRepository');

async function list(id_empresa) {
  if (id_empresa) return repository.findAllByEmpresa(id_empresa);
  return repository.findAll();
}

async function getById(id) {
  const c = await repository.findById(id);
  if (!c) {
    const err = new Error('Categoria não encontrada');
    err.status = 404;
    throw err;
  }
  return c;
}

async function create(body) {
  if (!body.nome) {
    const err = new Error('nome é obrigatório');
    err.status = 400;
    throw err;
  }
  if (!body.id_empresa) {
    const err = new Error('id_empresa é obrigatório');
    err.status = 400;
    throw err;
  }
  return repository.create({ nome: body.nome, id_empresa: parseInt(body.id_empresa) });
}

async function update(id, body) {
  const c = await repository.findById(id);
  if (!c) {
    const err = new Error('Categoria não encontrada');
    err.status = 404;
    throw err;
  }
  if (body.nome !== undefined) c.nome = body.nome;
  if (body.id_empresa !== undefined) c.id_empresa = body.id_empresa ? parseInt(body.id_empresa) : c.id_empresa;
  await repository.save(c);
  return repository.findById(id);
}

async function remove(id) {
  const c = await repository.findById(id);
  if (!c) {
    const err = new Error('Categoria não encontrada');
    err.status = 404;
    throw err;
  }
  await repository.remove(c);
}

module.exports = { list, getById, create, update, remove };