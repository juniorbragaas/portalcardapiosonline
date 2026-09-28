const service = require('../services/productService');

async function list(req, res, next) {
  try {
    // USER vê somente os produtos da sua empresa
    if (req.user?.usertype === 'USER') {
      if (!req.user.id_empresa) {
        return res.status(403).json({ message: 'Usuário sem empresa vinculada' });
      }
      return res.json(await service.listByEmpresa(req.user.id_empresa));
    }
    // ADMIN: filtra por empresa se passar ?id_empresa=X, senão lista tudo
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
    // USER sempre cadastra na sua própria empresa — força id_empresa do token
    // independente do que vier no body (select disabled não envia o valor)
    const id_empresa = req.user?.usertype === 'USER'
      ? req.user.id_empresa
      : req.body.id_empresa;

    if (!id_empresa) {
      // Detalha o motivo para facilitar diagnóstico
      const motivo = req.user?.usertype === 'USER'
        ? `Usuário "${req.user.login}" não tem empresa vinculada (id_empresa no token: ${req.user.id_empresa})`
        : 'id_empresa é obrigatório';
      return res.status(400).json({ message: motivo });
    }

    res.status(201).json(await service.create({ ...req.body, id_empresa }, req.file));
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    // USER não pode mudar a empresa do produto
    if (req.user?.usertype === 'USER') {
      delete req.body.id_empresa;
    }
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
