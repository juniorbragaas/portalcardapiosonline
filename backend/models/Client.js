const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/database');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome_completo: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  alias: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  endereco: {
    type: DataTypes.STRING(300),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  celular: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  logo: {
    type: DataTypes.BLOB('long'),
    allowNull: true
  },
  banner: {
    type: DataTypes.BLOB('long'),
    allowNull: true
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  }
}, {
  tableName: 'clientes',
  timestamps: true
});

module.exports = Client;
