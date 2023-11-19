const redis = require('redis');
const dotnev = require("dotenv")
dotnev.config();

const redisClient = redis.createClient();

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
    console.error('Error connecting to Redis:', err);
});
redisClient.connect();
module.exports = redisClient;

