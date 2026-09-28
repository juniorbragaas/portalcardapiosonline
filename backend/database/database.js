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

  // Associações necessárias para includes/joins
  Product.belongsTo(Client, { foreignKey: 'id_empresa', as: 'empresa' });
  Client.hasMany(Product,   { foreignKey: 'id_empresa', as: 'produtos' });
  // Nota: User.belongsTo(Client) não é declarado aqui pois o SQLite
  // não suporta adicionar FK constraints via ALTER TABLE — o campo
  // id_empresa em User é gerenciado manualmente sem constraint de FK.

  await sequelize.authenticate();

  await sequelize.query('PRAGMA foreign_keys = OFF');
  // { drop: false } garante que só adiciona colunas novas, nunca recria tabelas
  await sequelize.sync({ alter: { drop: false } });
  await sequelize.query('PRAGMA foreign_keys = ON');

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
