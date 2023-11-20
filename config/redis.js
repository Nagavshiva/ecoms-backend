const redis = require('redis');
const dotenv = require('dotenv');
dotenv.config();

const redisHost = process.env.REDIS_URL


const redisClient = redis.createClient({
  host: redisHost,
});

(async () => {
  await redisClient.connect();
})();

console.log('Connecting to Redis...');

redisClient.on('ready', () => {
  console.log('Connected to Redis!');
});

redisClient.on('error', (err) => {
  console.error('Error connecting to Redis:', err);
});


module.exports = redisClient;