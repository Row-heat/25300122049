const jwt = require('jsonwebtoken');

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

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                message: 'Invalid or expired token',
                error: 'FORBIDDEN'
            });
        }
        req.user = user;
        next();
    });
};

// Middleware to verify specific user access
const verifyUserAccess = (req, res, next) => {
    const { user } = req;
    
    // Check if user has the required access code
    if (user.accessCode !== process.env.ACCESS_CODE) {
        return res.status(403).json({
            message: 'Access denied - invalid access code',
            error: 'ACCESS_DENIED'
        });
    }
    
    next();
};

module.exports = {
    authenticateToken,
    verifyUserAccess
};
