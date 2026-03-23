const { createClient } = require('redis');

let redisClient = null;
let redisEnabled = false;
let lastRedisErrorAt = 0;

const getRedisUrl = () => process.env.REDIS_URL || process.env.REDIS_TLS_URL;

const initializeRedis = async () => {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = getRedisUrl();
  if (!redisUrl) {
    console.log('Redis URL not configured. Continuing without cache.');
    return null;
  }

  const isTlsRedis = redisUrl.startsWith('rediss://');

  redisClient = createClient({
    url: redisUrl,
    socket: {
      tls: isTlsRedis,
      rejectUnauthorized: false,
      reconnectStrategy: (retries) => Math.min(retries * 200, 2000),
    },
  });

  redisClient.on('ready', () => {
    redisEnabled = true;
    console.log('Redis connected');
  });

  redisClient.on('end', () => {
    redisEnabled = false;
    console.warn('Redis connection closed');
  });

  redisClient.on('error', (error) => {
    redisEnabled = false;

    const now = Date.now();
    if (now - lastRedisErrorAt > 5000) {
      console.error('Redis error:', error.message);
      lastRedisErrorAt = now;
    }
  });

  try {
    await redisClient.connect();
  } catch (error) {
    redisEnabled = false;
    console.error('Failed to connect to Redis:', error.message);
  }

  return redisClient;
};

const isCacheAvailable = () => Boolean(redisClient && redisEnabled && redisClient.isOpen);

const getCachedJson = async (key) => {
  if (!isCacheAvailable()) {
    return null;
  }

  try {
    const data = await redisClient.get(key);
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Redis get failed:', error.message);
    return null;
  }
};

const setCachedJson = async (key, value, ttlSeconds) => {
  if (!isCacheAvailable()) {
    return;
  }

  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
  } catch (error) {
    console.error('Redis set failed:', error.message);
  }
};

const deleteCacheByPrefix = async (prefix) => {
  if (!isCacheAvailable()) {
    return;
  }

  try {
    const keys = [];
    for await (const key of redisClient.scanIterator({ MATCH: `${prefix}*`, COUNT: 100 })) {
      keys.push(key);
    }

    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Redis delete by prefix failed:', error.message);
  }
};

module.exports = {
  initializeRedis,
  getCachedJson,
  setCachedJson,
  deleteCacheByPrefix,
};
