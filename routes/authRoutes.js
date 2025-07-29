const express = require('express');
const { login, autoLogin, getProfile, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Public routes
router.post('/login', login);
router.get('/auto-login', autoLogin); // Direct login with provided credentials

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout);

module.exports = router;
