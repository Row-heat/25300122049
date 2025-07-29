require('dotenv').config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const logger = require("./middleware/logger");
const urlRoutes = require("./routes/urlRoutes");
const authRoutes = require("./routes/authRoutes");
const logRoutes = require("./routes/logRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use(limiter);

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Custom logging middleware
app.use(logger);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ 
        status: "OK", 
        message: "URL Shortener Backend is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Info endpoint
app.get("/api/info", (req, res) => {
    res.status(200).json({
        name: "URL Shortener API",
        version: "1.0.0",
        description: "A secure URL shortening service with authentication and logging",
        endpoints: {
            auth: {
                login: "POST /auth/login",
                profile: "GET /auth/profile",
                logout: "POST /auth/logout"
            },
            urls: {
                create: "POST /shorturls",
                list: "GET /shorturls",
                stats: "GET /shorturls/:code",
                redirect: "GET /:code"
            },
            logs: {
                create: "POST /logs",
                list: "GET /logs",
                getById: "GET /logs/:logId"
            }
        },
        author: {
            name: process.env.USER_NAME,
            email: process.env.USER_EMAIL,
            rollNo: process.env.USER_ROLL_NO
        }
    });
});

// Routes
app.use("/auth", authRoutes);
app.use("/logs", logRoutes);
app.use("/", urlRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        message: "Route not found",
        error: "NOT_FOUND",
        path: req.originalUrl,
        method: req.method
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({
        message: "Internal server error",
        error: "SERVER_ERROR",
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 API documentation available at http://localhost:${PORT}/api/info`);
    console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
    console.log(`👤 User: ${process.env.USER_NAME} (${process.env.USER_EMAIL})`);
});
