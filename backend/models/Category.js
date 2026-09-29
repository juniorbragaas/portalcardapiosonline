const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  id_empresa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clientes',
      key: 'id'
    }
  }
}, {
  tableName: 'categorias',
  timestamps: true
});

module.exports = Category;
