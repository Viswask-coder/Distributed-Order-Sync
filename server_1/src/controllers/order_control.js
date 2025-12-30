const orderService = require('../services/order_service');
const orderModel = require('../models/order_model');

// User creates an order
const placeOrder = async (req, res) => {
    try {
        const result = await orderService.createOrder(req.body);

        res.status(201).json({
             success: true,
              data: result 
            });
    } catch (err) {
        console.error(err);
        res.status(500).json({
             success: false, 
             message: "Server Error" 
            });
    }
};

// Other server sends us an order
const receiveSync = async (req, res) => {
    try {
        console.log(`Receiving order: ${req.body.order_uuid}`);

        await orderModel.syncOrder(req.body);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
};

module.exports = { placeOrder, receiveSync };