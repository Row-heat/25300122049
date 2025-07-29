const jwt = require('jsonwebtoken');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// In-memory storage for demonstration (use database in production)
let authTokens = {};
let userSessions = {};

// Generate JWT token for the user
const generateToken = (userData) => {
    const payload = {
        MapClaims: {
            aud: process.env.EVALUATION_SERVICE_URL,
            email: userData.email,
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
            iat: Math.floor(Date.now() / 1000),
            iss: "Afford Medical Technologies Private Limited",
            jti: uuidv4(),
            locale: "en-IN",
            name: userData.name,
            sub: userData.clientID
        },
        email: userData.email,
        name: userData.name,
        rollNo: userData.rollNo,
        accessCode: userData.accessCode,
        clientID: userData.clientID,
        clientSecret: userData.clientSecret
    };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

// Login endpoint
const login = async (req, res) => {
    try {
        const { email, password, rollNo, accessCode } = req.body;

        // Validate required fields
        if (!email || !rollNo || !accessCode) {
            return res.status(400).json({
                message: 'Email, roll number, and access code are required',
                error: 'MISSING_FIELDS'
            });
        }

        // Verify against environment variables (in production, verify against database)
        if (email !== process.env.USER_EMAIL || 
            rollNo !== process.env.USER_ROLL_NO || 
            accessCode !== process.env.ACCESS_CODE) {
            return res.status(401).json({
                message: 'Invalid credentials',
                error: 'INVALID_CREDENTIALS'
            });
        }

        const userData = {
            email: process.env.USER_EMAIL,
            name: process.env.USER_NAME,
            rollNo: process.env.USER_ROLL_NO,
            accessCode: process.env.ACCESS_CODE,
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET
        };

        const accessToken = generateToken(userData);
        const expiresIn = Math.floor(Date.now() / 1000) + (24 * 60 * 60);

        // Store session
        const sessionId = uuidv4();
        userSessions[sessionId] = {
            ...userData,
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };

        authTokens[accessToken] = {
            userData,
            sessionId,
            expiresAt: expiresIn
        };

        res.status(200).json({
            token_type: "Bearer",
            access_token: accessToken,
            expires_in: expiresIn,
            user: {
                email: userData.email,
                name: userData.name,
                rollNo: userData.rollNo,
                clientID: userData.clientID
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Internal server error during login',
            error: 'SERVER_ERROR'
        });
    }
};

// Get user profile
const getProfile = (req, res) => {
    try {
        const { user } = req;
        
        res.status(200).json({
            email: user.email,
            name: user.name,
            rollNo: user.rollNo,
            accessCode: user.accessCode,
            clientID: user.clientID
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            message: 'Error retrieving user profile',
            error: 'SERVER_ERROR'
        });
    }
};

// Logout
const logout = (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token && authTokens[token]) {
            const { sessionId } = authTokens[token];
            delete authTokens[token];
            delete userSessions[sessionId];
        }

        res.status(200).json({
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            message: 'Error during logout',
            error: 'SERVER_ERROR'
        });
    }
};

module.exports = {
    login,
    getProfile,
    logout
};
