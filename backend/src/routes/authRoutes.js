const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

// Login
router.post('/login', authController.login);

// Registro
router.post('/register', authController.register);

module.exports = router;
