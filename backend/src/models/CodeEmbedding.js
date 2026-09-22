const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Stores vector embeddings of repository files for semantic search
const CodeEmbedding = sequelize.define('CodeEmbedding', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  repoFullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filePath: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // Code chunk (max ~2000 tokens)
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // pgvector column — 768 dimensions (text-embedding-004)
  embedding: {
    type: DataTypes.TEXT, // stored as JSON string; queried via raw SQL
    allowNull: true,
  },
  language: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sha: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  chunkIndex: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'code_embeddings',
  timestamps: true,
  indexes: [
    { fields: ['repoFullName'] },
    { fields: ['filePath'] },
  ],
});

module.exports = CodeEmbedding;
