const repository = require('../repositories/productRepository');
const clientRepository = require('../repositories/clientRepository');

// Converte BLOB de foto para base64
function serialize(product) {
  const data = product.toJSON ? product.toJSON() : { ...product };

  data.foto_produto = data.foto_produto
    ? `data:image/*;base64,${Buffer.from(data.foto_produto).toString('base64')}`
    : null;

  // Garante valor como número
  data.valor = parseFloat(data.valor);

  return data;
}

async function list() {
  const products = await repository.findAll();
  return products.map(p => {
    const data = p.toJSON();
    data.valor = parseFloat(data.valor);
    return data;
  });
}

async function listByEmpresa(id_empresa) {
  const products = await repository.findAllByEmpresa(id_empresa);
  return products.map(p => {
    const data = p.toJSON();
    data.valor = parseFloat(data.valor);
    return data;
  });
}

async function getById(id) {
  const product = await repository.findById(id);
  if (!product) {
    const error = new Error('Produto não encontrado');
    error.status = 404;
    throw error;
  }
  return serialize(product);
}

async function create(body, file) {
  if (!body.nome_produto) {
    const error = new Error('nome_produto é obrigatório');
    error.status = 400;
    throw error;
  }

  if (!body.id_empresa) {
    const error = new Error('id_empresa é obrigatório');
    error.status = 400;
    throw error;
  }

  const empresa = await clientRepository.findById(body.id_empresa);
  if (!empresa) {
    const error = new Error('Empresa (cliente) não encontrada');
    error.status = 404;
    throw error;
  }

  const valor = parseFloat(body.valor);
  if (isNaN(valor) || valor < 0) {
    const error = new Error('Valor inválido');
    error.status = 400;
    throw error;
  }

  const product = await repository.create({
    nome_produto: body.nome_produto,
    descricao:    body.descricao    || null,
    categoria:    body.categoria    || null,
    id_empresa:   parseInt(body.id_empresa),
    valor,
    foto_produto: file?.buffer || null
  });

  // Recarrega com associação
  return serialize(await repository.findById(product.id));
}

async function update(id, body, file) {
  const product = await repository.findById(id);
  if (!product) {
    const error = new Error('Produto não encontrado');
    error.status = 404;
    throw error;
  }

  if (body.id_empresa !== undefined) {
    const empresa = await clientRepository.findById(body.id_empresa);
    if (!empresa) {
      const error = new Error('Empresa (cliente) não encontrada');
      error.status = 404;
      throw error;
    }
    product.id_empresa = parseInt(body.id_empresa);
  }

  if (body.nome_produto !== undefined) product.nome_produto = body.nome_produto;
  if (body.descricao    !== undefined) product.descricao    = body.descricao;
  if (body.categoria    !== undefined) product.categoria    = body.categoria;

  if (body.valor !== undefined) {
    const valor = parseFloat(body.valor);
    if (isNaN(valor) || valor < 0) {
      const error = new Error('Valor inválido');
      error.status = 400;
      throw error;
    }
    product.valor = valor;
  }

  if (file?.buffer) product.foto_produto = file.buffer;

  await repository.save(product);
  return serialize(await repository.findById(product.id));
}

async function remove(id) {
  const product = await repository.findById(id);
  if (!product) {
    const error = new Error('Produto não encontrado');
    error.status = 404;
    throw error;
  }
  await repository.remove(product);
}

module.exports = { list, listByEmpresa, getById, create, update, remove };
