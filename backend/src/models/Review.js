const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  pullRequestId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'pull_requests', key: 'id' },
  },
  // Overall AI summary
  summary: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Structured analysis results (JSON)
  bugs: {
    type: DataTypes.JSONB,
    defaultValue: [],
    // [{file, line, severity, description, suggestion}]
  },
  securityIssues: {
    type: DataTypes.JSONB,
    defaultValue: [],
    // [{file, line, severity, cwe, description, suggestion}]
  },
  codeQuality: {
    type: DataTypes.JSONB,
    defaultValue: [],
    // [{file, issue, suggestion}]
  },
  complexity: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // {score: 1-10, hotspots: [{file, reason}], suggestion}
  },
  // Numeric scores (0-100)
  overallScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  bugScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  securityScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  qualityScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // Raw diff that was analyzed
  diffSnapshot: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  model: {
    type: DataTypes.STRING,
    defaultValue: 'gemini-2.5-flash',
  },
}, {
  tableName: 'reviews',
  timestamps: true,
});

module.exports = Review;
