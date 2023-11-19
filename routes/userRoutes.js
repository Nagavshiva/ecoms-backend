const express = require('express');
const userController = require('../controllers/userController')
const admin = require("../middlewares/authMiddleware")

const router = express.Router();

// User registration route
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/',admin.admin,userController.getAllUsers);
router.delete('/:id',admin.admin,userController.deleteUser);

module.exports = router;