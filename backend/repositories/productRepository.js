const Product = require('../models/Product');
const Client = require('../models/Client');
const { sequelize } = require('../database/database');

// Campos sem BLOB para listagens
const LIST_ATTRIBUTES = [
  'id', 'nome_produto', 'descricao', 'categoria',
  'id_empresa', 'valor', 'createdAt', 'updatedAt'
];

module.exports = {
  findAll() {
    return Product.findAll({
      attributes: LIST_ATTRIBUTES,
      include: [{
        model: Client,
        as: 'empresa',
        attributes: ['id', 'nome_completo', 'alias']
      }],
      order: [['id', 'ASC']]
    });
  },

  findAllByEmpresa(id_empresa) {
    return Product.findAll({
      attributes: LIST_ATTRIBUTES,
      where: { id_empresa },
      include: [{
        model: Client,
        as: 'empresa',
        attributes: ['id', 'nome_completo', 'alias']
      }],
      order: [['id', 'ASC']]
    });
  },

  findById(id) {
    return Product.findByPk(id, {
      include: [{
        model: Client,
        as: 'empresa',
        attributes: ['id', 'nome_completo', 'alias']
      }]
    });
  },

  count() {
    return Product.count();
  },

  // Conta produtos agrupados por empresa — retorna [{ id_empresa, total_produtos }]
  countGroupByEmpresa() {
    return Product.findAll({
      attributes: [
        'id_empresa',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_produtos']
      ],
      group: ['id_empresa'],
      raw: true
    });
  },

  create(data) {
    return Product.create(data);
  },

  save(product) {
    return product.save();
  },

  remove(product) {
    return product.destroy();
  }
};
