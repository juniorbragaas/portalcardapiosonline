const Client = require('../models/Client');

// Campos retornados em listagens (sem os BLOBs para não sobrecarregar)
const LIST_ATTRIBUTES = [
  'id', 'nome_completo', 'alias', 'endereco',
  'email', 'celular', 'descricao', 'status',
  'latitude', 'longitude',
  'createdAt', 'updatedAt'
];

module.exports = {
  findByAlias(alias) {
    return Client.findOne({ where: { alias } });
  },
  findAll() {
    return Client.findAll({
      attributes: LIST_ATTRIBUTES,
      order: [['id', 'ASC']]
    });
  },
  findById(id) {
    // Inclui BLOBs ao buscar por ID
    return Client.findByPk(id);
  },
  count() {
    return Client.count();
  },
  countActive() {
    return Client.count({ where: { status: true } });
  },
  create(data) {
    return Client.create(data);
  },
  save(client) {
    return client.save();
  },
  remove(client) {
    return client.destroy();
  }
};
