const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database/banco.db',
  logging: false
});

async function initDatabase() {
  const User = require('../models/User');
  const Client = require('../models/Client');
  const Product = require('../models/Product');

  // Associações
  Product.belongsTo(Client, { foreignKey: 'id_empresa', as: 'empresa' });
  Client.hasMany(Product,   { foreignKey: 'id_empresa', as: 'produtos' });

  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const count = await User.count();
  if (count === 0) {
    await User.create({
      login: 'admin',
      password: await bcrypt.hash('admin123', 10),
      usertype: 'ADMIN'
    });
    console.log('Usuário inicial criado: admin / admin123');
  }

  return { User, Client };
}

module.exports = { sequelize, initDatabase };
