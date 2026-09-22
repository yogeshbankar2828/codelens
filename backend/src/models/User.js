const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  githubId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  avatarUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  githubAccessToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('admin', 'developer', 'viewer'),
    defaultValue: 'developer',
  },
  connectedRepos: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
