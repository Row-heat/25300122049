const express = require('express');
const { login, getProfile, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout);

module.exports = router;
