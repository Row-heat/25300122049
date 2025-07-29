const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// In-memory log storage (use database in production)
let logs = {};

// Create log entry
const createLog = (req, res) => {
    try {
        const { action, details, level = 'info' } = req.body;
        
        if (!action) {
            return res.status(400).json({
                message: 'Action is required for logging',
                error: 'MISSING_ACTION'
            });
        }

        const logID = uuidv4();
        const logEntry = {
            logID,
            action,
            details: details || {},
            level,
            timestamp: new Date().toISOString(),
            userEmail: req.user?.email || 'anonymous',
            userName: req.user?.name || 'anonymous',
            userRollNo: req.user?.rollNo || 'unknown',
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent') || 'unknown'
        };

        // Store in memory
        logs[logID] = logEntry;

        // Also write to file for persistence
        const logDir = path.join(__dirname, '../logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
        const logLine = `${logEntry.timestamp} [${logEntry.level.toUpperCase()}] ${logEntry.action} - User: ${logEntry.userEmail} - Details: ${JSON.stringify(logEntry.details)}\n`;
        
        fs.appendFileSync(logFile, logLine);

        res.status(201).json({
            logID,
            message: 'Log created successfully'
        });

    } catch (error) {
        console.error('Create log error:', error);
        res.status(500).json({
            message: 'Error creating log entry',
            error: 'SERVER_ERROR'
        });
    }
};

// Get logs with filtering
const getLogs = (req, res) => {
    try {
        const { level, action, startDate, endDate, limit = 100 } = req.query;
        
        let filteredLogs = Object.values(logs);

        // Apply filters
        if (level) {
            filteredLogs = filteredLogs.filter(log => log.level === level);
        }
        
        if (action) {
            filteredLogs = filteredLogs.filter(log => 
                log.action.toLowerCase().includes(action.toLowerCase())
            );
        }
        
        if (startDate) {
            filteredLogs = filteredLogs.filter(log => 
                new Date(log.timestamp) >= new Date(startDate)
            );
        }
        
        if (endDate) {
            filteredLogs = filteredLogs.filter(log => 
                new Date(log.timestamp) <= new Date(endDate)
            );
        }

        // Sort by timestamp (newest first)
        filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Apply limit
        filteredLogs = filteredLogs.slice(0, parseInt(limit));

        res.status(200).json({
            logs: filteredLogs,
            total: filteredLogs.length,
            filters: { level, action, startDate, endDate, limit }
        });

    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({
            message: 'Error retrieving logs',
            error: 'SERVER_ERROR'
        });
    }
};

// Get specific log by ID
const getLogById = (req, res) => {
    try {
        const { logId } = req.params;
        
        const log = logs[logId];
        if (!log) {
            return res.status(404).json({
                message: 'Log not found',
                error: 'LOG_NOT_FOUND'
            });
        }

        res.status(200).json(log);

    } catch (error) {
        console.error('Get log by ID error:', error);
        res.status(500).json({
            message: 'Error retrieving log',
            error: 'SERVER_ERROR'
        });
    }
};

// Auto-log middleware for URL operations
const autoLog = (action, level = 'info') => {
    return (req, res, next) => {
        // Store original res.json
        const originalJson = res.json;
        
        res.json = function(data) {
            // Create log entry
            const logID = uuidv4();
            const logEntry = {
                logID,
                action: `URL_${action}`,
                details: {
                    method: req.method,
                    path: req.originalUrl,
                    body: req.body,
                    params: req.params,
                    query: req.query,
                    statusCode: res.statusCode,
                    responseData: data
                },
                level,
                timestamp: new Date().toISOString(),
                userEmail: req.user?.email || 'anonymous',
                userName: req.user?.name || 'anonymous',
                userRollNo: req.user?.rollNo || 'unknown',
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent') || 'unknown'
            };

            logs[logID] = logEntry;

            // Write to file
            try {
                const logDir = path.join(__dirname, '../logs');
                if (!fs.existsSync(logDir)) {
                    fs.mkdirSync(logDir, { recursive: true });
                }

                const logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
                const logLine = `${logEntry.timestamp} [${logEntry.level.toUpperCase()}] ${logEntry.action} - User: ${logEntry.userEmail} - Status: ${res.statusCode}\n`;
                
                fs.appendFileSync(logFile, logLine);
            } catch (writeError) {
                console.error('Error writing to log file:', writeError);
            }

            // Call original res.json
            return originalJson.call(this, data);
        };

        next();
    };
};

module.exports = {
    createLog,
    getLogs,
    getLogById,
    autoLog
};
