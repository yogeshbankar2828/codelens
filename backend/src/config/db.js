require('dotenv').config();
const { Sequelize } = require('sequelize');

const dbOptions = {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: process.env.DATABASE_URL
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, dbOptions)
  : new Sequelize(
      process.env.DB_NAME || 'codelens',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'postgres123',
      {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        ...dbOptions,
      }
    );

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');

    // Enable pgvector extension
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('✅ pgvector extension enabled');

    // Sync all models — use drop:false to avoid constraint name mismatches on Neon
    await sequelize.sync({ alter: { drop: false } });
    console.log('✅ Database models synced');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
