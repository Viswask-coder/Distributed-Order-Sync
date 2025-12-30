const express = require('express');
const router = express.Router();
const controller = require('../controllers/order_control');
const { validateOrder } = require('../validators/order_validator');

router.post('/', validateOrder, controller.placeOrder);   // place order
router.post('/receive', controller.receiveSync);             // Sync Receiver  must be before /:order_uuid
router.post('/:order_uuid',  controller.updateOrder);      // update order

module.exports = router;