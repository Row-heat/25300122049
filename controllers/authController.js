const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Default user credentials from your provided data
const DEFAULT_USER = {
    email: "rohitsingh24685@hmail.com",
    name: "rohit singh",
    rollNo: "25300122049",
    accessCode: "AYkwcf",
    clientID: "e640ccbd-d324-47a7-9fac-32bb7c3ccde6",
    clientSecret: "PfEeUTFBZJXhZRTt"
};

// Your provided token
const PROVIDED_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJyb2hpdHNpbmdoMjQ2ODVAaG1haWwuY29tIiwiZXhwIjoxNzUzNzc0MDk1LCJpYXQiOjE3NTM3NzMxOTUsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI4M2Y4NWEzZC01ZDAxLTQ5YmMtYTAzYi1jMmYzZWY3ZmExNzAiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJyb2hpdCBzaW5naCIsInN1YiI6ImU2NDBjY2JkLWQzMjQtNDdhNy05ZmFjLTMyYmI3YzNjY2RlNiJ9LCJlbWFpbCI6InJvaGl0c2luZ2gyNDY4NUBobWFpbC5jb20iLCJuYW1lIjoicm9oaXQgc2luZ2giLCJyb2xsTm8iOiIyNTMwMDEyMjA0OSIsImFjY2Vzc0NvZGUiOiJBWWt3Y2YiLCJjbGllbnRJRCI6ImU2NDBjY2JkLWQzMjQtNDdhNy05ZmFjLTMyYmI3YzNjY2RlNiIsImNsaWVudFNlY3JldCI6IlBmRWVVVEZCWkpYaFpSVHQifQ.WldztVDKxI2IJ459BsrDkDyuQk7kmIXgielfm0g2IfM";

// In-memory storage for demonstration
let authTokens = {};
let userSessions = {};

// Simple login endpoint
const login = async (req, res) => {
    try {
        const { email, accessCode } = req.body;

        if (!email || !accessCode) {
            return res.status(400).json({
                message: 'Email and access code are required',
                error: 'MISSING_FIELDS'
            });
        }

        if (email !== DEFAULT_USER.email || accessCode !== DEFAULT_USER.accessCode) {
            return res.status(401).json({
                message: 'Invalid credentials',
                error: 'INVALID_CREDENTIALS'
            });
        }

        const sessionId = uuidv4();
        const accessToken = PROVIDED_TOKEN;
        const expiresIn = 1753774095;

        authTokens[accessToken] = {
            user: DEFAULT_USER,
            expiresAt: new Date(expiresIn * 1000).toISOString()
        };

        return res.status(200).json({
            token_type: "Bearer",
            access_token: accessToken,
            expires_in: expiresIn,
            user: {
                email: DEFAULT_USER.email,
                name: DEFAULT_USER.name,
                rollNo: DEFAULT_USER.rollNo,
                clientID: DEFAULT_USER.clientID
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: 'SERVER_ERROR'
        });
    }
};

// Auto-login endpoint
const autoLogin = async (req, res) => {
    try {
        const sessionId = uuidv4();
        const accessToken = PROVIDED_TOKEN;
        const expiresIn = 1753774095;

        authTokens[accessToken] = {
            user: DEFAULT_USER,
            expiresAt: new Date(expiresIn * 1000).toISOString()
        };

        return res.status(200).json({
            token_type: "Bearer",
            access_token: accessToken,
            expires_in: expiresIn,
            user: DEFAULT_USER,
            message: "Auto-logged in with provided credentials"
        });
    } catch (error) {
        console.error('Auto-login error:', error);
        return res.status(500).json({
            message: 'Internal server error',
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
            delete authTokens[token];
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

// Verify token for middleware
const verifyToken = (token) => {
    return authTokens[token] || null;
};

module.exports = {
    login,
    autoLogin,
    getProfile,
    logout,
    verifyToken,
    DEFAULT_USER,
    PROVIDED_TOKEN
};
