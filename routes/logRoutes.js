const express = require('express');
const { createLog, getLogs, getLogById } = require('../controllers/logController');
const { authenticateToken, verifyUserAccess } = require('../middleware/auth');
const router = express.Router();

// All logging routes require authentication
router.post('/', authenticateToken, verifyUserAccess, createLog);
router.get('/', authenticateToken, verifyUserAccess, getLogs);
router.get('/:logId', authenticateToken, verifyUserAccess, getLogById);

module.exports = router;
