const jwt = require('jsonwebtoken');
const { verifyToken } = require('../controllers/authController');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            message: 'Access token required',
            error: 'UNAUTHORIZED'
        });
    }

    const tokenData = verifyToken(token);
    
    if (!tokenData) {
        return res.status(403).json({ 
            message: 'Invalid or expired token',
            error: 'FORBIDDEN'
        });
    }

    const now = new Date();
    const expiryDate = new Date(tokenData.expiresAt);
    
    if (now > expiryDate) {
        return res.status(403).json({ 
            message: 'Token expired',
            error: 'TOKEN_EXPIRED'
        });
    }

    req.user = tokenData.user;
    next();
};

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        const tokenData = verifyToken(token);
        if (tokenData) {
            const now = new Date();
            const expiryDate = new Date(tokenData.expiresAt);
            
            if (now <= expiryDate) {
                req.user = tokenData.user;
            }
        }
    }
    
    next();
};

const verifyUserAccess = (req, res, next) => {
    const { user } = req;
    
    if (user.accessCode !== "AYkwcf") {
        return res.status(403).json({
            message: 'Access denied - invalid access code',
            error: 'ACCESS_DENIED'
        });
    }
    
    next();
};

module.exports = {
    authenticateToken,
    optionalAuth,
    verifyUserAccess
};
