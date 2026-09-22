const Redis = require('ioredis');

const getRedisConfig = () => {
  if (process.env.REDIS_URL) {
    // Parse rediss:// or redis:// URL
    const url = new URL(process.env.REDIS_URL);
    const isTls = url.protocol === 'rediss:' || process.env.REDIS_TLS === 'true';

    return {
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      username: url.username || 'default',
      password: url.password || undefined,
      tls: isTls ? {} : undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };
  }

  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    maxRetriesPerRequest: 3,
  };
};

const redisConfig = getRedisConfig();
const redis = new Redis(redisConfig);

redis.on('connect', () => console.log('✅ Redis connected successfully'));
redis.on('error', (err) => console.error('❌ Redis error:', err.message));

module.exports = { redis, redisConfig };
