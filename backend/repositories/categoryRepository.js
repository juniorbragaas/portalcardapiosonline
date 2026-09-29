const Category = require('../models/Category');

module.exports = {
  findAll() {
    return Category.findAll({ order: [['nome', 'ASC']] });
  },

  findAllByEmpresa(id_empresa) {
    return Category.findAll({ where: { id_empresa }, order: [['nome', 'ASC']] });
  },

  findById(id) {
    return Category.findByPk(id);
  },

  create(data) {
    return Category.create(data);
  },

  save(category) {
    return category.save();
  },

  remove(category) {
    return category.destroy();
  }
};
