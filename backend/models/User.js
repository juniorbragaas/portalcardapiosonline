const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  login: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  usertype: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'USER' },
  id_empresa: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'usuarios',
  timestamps: true
});

module.exports = User;
