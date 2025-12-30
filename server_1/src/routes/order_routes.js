const express = require('express');
const router = express.Router();
const controller = require('../controllers/order.controller');
const { validateOrder } = require('../validators/order_validator');

router.post('/', validateOrder, controller.placeOrder);      // Local Create
router.post('/receive', controller.receiveSync);             // Sync Receiver

module.exports = router;