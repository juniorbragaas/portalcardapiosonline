const repository = require('../repositories/clientRepository');

// Converte BLOBs para base64 e monta o JSON completo do cliente
function serialize(client) {
  const data = client.toJSON ? client.toJSON() : { ...client };

  data.logo = data.logo
    ? `data:image/*;base64,${Buffer.from(data.logo).toString('base64')}`
    : null;

  data.banner = data.banner
    ? `data:image/*;base64,${Buffer.from(data.banner).toString('base64')}`
    : null;

  return data;
}

async function list() {
  // Listagem sem BLOBs (performance)
  const clients = await repository.findAll();
  return clients.map(c => c.toJSON());
}

async function getById(id) {
  const client = await repository.findById(id);
  if (!client) {
    const error = new Error('Cliente não encontrado');
    error.status = 404;
    throw error;
  }
  return serialize(client);
}

async function create(body, files) {
  if (!body.nome_completo) {
    const error = new Error('nome_completo é obrigatório');
    error.status = 400;
    throw error;
  }

  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    const error = new Error('E-mail inválido');
    error.status = 400;
    throw error;
  }

  const client = await repository.create({
    nome_completo: body.nome_completo,
    alias:         body.alias        || null,
    endereco:      body.endereco     || null,
    email:         body.email        || null,
    celular:       body.celular      || null,
    descricao:     body.descricao    || null,
    status:        body.status === true || body.status === 'true' || body.status === undefined,
    logo:          files?.logo?.[0]?.buffer   || null,
    banner:        files?.banner?.[0]?.buffer || null
  });

  return serialize(client);
}

async function update(id, body, files) {
  const client = await repository.findById(id);
  if (!client) {
    const error = new Error('Cliente não encontrado');
    error.status = 404;
    throw error;
  }

  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    const error = new Error('E-mail inválido');
    error.status = 400;
    throw error;
  }

  if (body.nome_completo !== undefined) client.nome_completo = body.nome_completo;
  if (body.alias         !== undefined) client.alias         = body.alias;
  if (body.endereco      !== undefined) client.endereco      = body.endereco;
  if (body.email         !== undefined) client.email         = body.email;
  if (body.celular       !== undefined) client.celular       = body.celular;
  if (body.descricao     !== undefined) client.descricao     = body.descricao;
  if (body.status        !== undefined) client.status        = body.status === true || body.status === 'true';
  if (files?.logo?.[0])                client.logo           = files.logo[0].buffer;
  if (files?.banner?.[0])              client.banner         = files.banner[0].buffer;

  await repository.save(client);
  return serialize(client);
}

async function remove(id) {
  const client = await repository.findById(id);
  if (!client) {
    const error = new Error('Cliente não encontrado');
    error.status = 404;
    throw error;
  }
  await repository.remove(client);
}

async function dashboard() {
  return {
    usuarios:       await require('../repositories/userRepository').count(),
    clientes:       await repository.count(),
    clientesAtivos: await repository.countActive(),
    produtos:       await require('../repositories/productRepository').count()
  };
}

module.exports = { list, getById, create, update, remove, dashboard, serialize };
