const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome_produto: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categoria: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  foto_produto: {
    type: DataTypes.BLOB('long'),
    allowNull: true
  },
  id_empresa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clientes',
      key: 'id'
    }
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  }
}, {
  tableName: 'produtos',
  timestamps: true
});

module.exports = Product;
