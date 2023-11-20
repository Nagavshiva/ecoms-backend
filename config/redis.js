const Redis = require('ioredis');
const dotenv = require('dotenv');
dotenv.config();

const redisHost = process.env.REDIS_URL

const redisClient = new Redis(redisHost);




redisClient.connect(() => {
  console.log('Connected to Redis!');
});

module.exports = redisClient;