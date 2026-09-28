const User = require('../models/User');

module.exports = {
  findAll() {
    return User.findAll({
      attributes: ['id', 'login', 'usertype', 'id_empresa', 'createdAt', 'updatedAt'],
      order: [['id', 'ASC']]
    });
  },
  findById(id) {
    return User.findByPk(id);
  },
  findByLogin(login) {
    return User.findOne({ where: { login } });
  },
  count() {
    return User.count();
  },
  create(data) {
    return User.create(data);
  },
  save(user) {
    return user.save();
  },
  remove(user) {
    return user.destroy();
  }
};
