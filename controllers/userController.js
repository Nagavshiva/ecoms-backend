const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const redisClient = require("../config/redis")

const genToken = (id) => {
    return jwt.sign({ id }, process.env.TOKEN_SECRET, { expiresIn: '60d' });
};

const registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the username already exists
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            username,
            password: hashedPassword
        });

        if (newUser) {
            res.status(201).json({
                _id: newUser._id,
                email: newUser.username,
                isAdmin: newUser.isAdmin,
                token: genToken(newUser._id),
                message: 'User registered successfully'
            });
        }

        await newUser.save();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}



const loginUser = async (req, res) => {
    try {
      const { username } = req.body;
  
      let isFromRedis = false;
      let user;
  
      // Check if the user is cached in Redis
      const cachedUser = await redisClient.get(`user:${username}`);
  
      if (cachedUser) {
        console.log('User found in cache');
        isFromRedis = true;
        user = JSON.parse(cachedUser);
      } else {
        // If the user is not cached, fetch from the database
        user = await User.findOne({ username });
      }
  
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Cache the user data in Redis if it wasn't already cached
      if (!isFromRedis) {
        await redisClient.set(`user:${username}`, JSON.stringify(user), 'EX', 60 * 60); // Cache for 1 hour
      }
  
      // Return the user data, including the data source flag
      res.json({
        _id: user._id,
        email: user.username,
        isAdmin: user.isAdmin,
        token: genToken(user._id),
        message: 'User Login successfully',
        isFromRedis,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
// Function to get all users
const getAllUsers = async (req, res) => {
  try {
      // Fetch all users from the database
      const users = await User.find();

      // Return the list of users
      res.json(users);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Function to delete a user
const deleteUser = async (req, res) => {
  try {
      const userId = req.params.id;

      // Check if the user exists
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Delete the user from the database
      await user.remove();

      // Remove the user from the Redis cache (if cached)
      await redisClient.del(`user:${user.username}`);

      // Return success message
      res.json({ message: 'User deleted successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
};


module.exports = { registerUser, loginUser, getAllUsers, deleteUser };
