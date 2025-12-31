const orderService = require('../services/order_services');
const orderModel = require('../models/order_model');

// User creates an order
const placeOrder = async (req, res) => {
    try {

        
        if (!req.body.user_id) {
            return res.status(400).json({
                success: false,
                message: "user_id is required"
            });
        }

        if (!req.body.amount && !req.body.product_ids) {
            console.log(" Validation failed: No amount or product_ids");
            return res.status(400).json({
                success: false,
                message: "Either amount or product_ids is required"
            });
        }
        
        const result = await orderService.createOrder(req.body);

        res.status(200).json({
             success: true,
             message: 'order is syncing...',
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

const updateOrder = async (req, res) => {
    try {
        const {order_uuid} = req.params;
        const data = req.body;

        if (!data.status && !data.amount) {
            return res.status(400).json({
                success: false,
                message: "status or amount required"
            });
        }

        const result = await orderService.updateOrder(order_uuid, data);

        res.status(200).json({
            success: true,
            message: 'order is syncing...',
            data: result 
        });
        
    } catch (error) {
        console.error(error);
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

module.exports = { placeOrder, receiveSync, updateOrder};