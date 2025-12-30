const express = require('express');
const router = express.Router();
const controller = require('../controllers/user_control');

router.post('/', controller.registerUser);       // Create User
router.post('/receive', controller.receiveUserSync); // Receive Sync

module.exports = router;