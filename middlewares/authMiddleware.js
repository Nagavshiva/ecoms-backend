const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const User = require("../models/userModel")

const authenticateUser = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const cachedUser = await redisClient.get(`user:${token}`);

      if (cachedUser) {
        // User found in Redis cache
        req.user = JSON.parse(cachedUser);
        next();
      } else {
        // User not found in Redis cache, fetch from database
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findById(decoded.id);

        // Cache user data in Redis
        await redisClient.set(`user:${token}`, 3600 * 1000, JSON.stringify(user));
        req.user = user;
        next();
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token.');
  }
};



const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin !== 'false') {
      next();
    } else {
      res.status(401);
      throw new Error('Not authorized as an admin.');
    }
  };

module.exports ={authenticateUser,admin};