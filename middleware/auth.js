const jwt = require('jsonwebtoken');
const { verifyToken } = require('../controllers/authController');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            message: 'Access token required',
            error: 'UNAUTHORIZED'
        });
    }

    // Verify token using our auth controller
    const tokenData = verifyToken(token);
    
    if (!tokenData) {
        return res.status(403).json({ 
            message: 'Invalid or expired token',
            error: 'FORBIDDEN'
        });
    }

    // Check if token is expired
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

// Optional authentication - doesn't fail if no token
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

// Middleware to verify specific user access
const verifyUserAccess = (req, res, next) => {
    const { user } = req;
    
    // Check if user has the required access code
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
