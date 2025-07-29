const fs = require('fs');
const path = require('path');

const logStream = fs.createWriteStream(path.join(__dirname, '../access.log'), { flags: 'a' });

const logger = (req, res, next) => {
    const logEntry = `${new Date().toISOString()} | ${req.method} ${req.originalUrl} | IP: ${req.ip}\n`;
    logStream.write(logEntry);
    next();
};

module.exports = logger;
