const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PullRequest = sequelize.define('PullRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  githubPrId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  repoFullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  authorAvatar: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('open', 'closed', 'merged'),
    defaultValue: 'open',
  },
  analysisStatus: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending',
  },
  headSha: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  baseBranch: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  headBranch: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  additions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  deletions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  changedFiles: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  githubUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  mergedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'pull_requests',
  timestamps: true,
  indexes: [
    { fields: ['repoFullName'] },
    { fields: ['analysisStatus'] },
    { unique: true, fields: ['githubPrId', 'repoFullName'] },
  ],
});

module.exports = PullRequest;
