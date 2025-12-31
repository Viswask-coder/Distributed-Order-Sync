const express = require('express');
const router = express.Router();
const database = require('../config/database'); // Your existing DB connection

router.get('/', async (req, res) => {
    const healthcheck = {
        server: 'Online',
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now()
    };

    try {
        // Simple check to see if DB is running
        await database.execute('SELECT 1');
        healthcheck.database = 'Connected';
        res.status(200).json(healthcheck);
    } catch (error) {
        healthcheck.database = 'Disconnected';
        res.status(503).json(healthcheck); // 503 means Service Unavailable
    }
});

module.exports = router;