import Redis from 'ioredis';

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  lazyConnect: false,

  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },

  reconnectOnError(err) {
    return err.message.includes('READONLY');
  },

  enableOfflineQueue: true,
  maxRetriesPerRequest: 5,
});


// Handle Redis connection events
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('ready', () => {
  console.log('Redis is ready');
});

redisClient.on('reconnecting', () => {
  console.log('Reconnecting to Redis...');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});


export default redisClient;