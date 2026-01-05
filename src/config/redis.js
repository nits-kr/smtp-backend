const Redis = require('ioredis');
const config = require('./config');
const logger = require('./logger');

const redisConnection = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    maxRetriesPerRequest: null,
});

redisConnection.on('connect', () => {
    logger.info('Redis connected');
});

redisConnection.on('error', (err) => {
    logger.error('Redis error', err);
});

module.exports = { redisConnection };
