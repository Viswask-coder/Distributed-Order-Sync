const winston = require('winston');
const path = require('path');

// Configure Winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        // 1. Write conflicts to a file
        new winston.transports.File({ 
            filename: path.join(__dirname, '../../logs/conflicts.log') 
        }),
        // 2. Also show in console
        new winston.transports.Console() 
    ]
});

module.exports = logger;