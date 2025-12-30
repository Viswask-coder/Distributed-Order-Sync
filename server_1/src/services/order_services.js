require('dotenv').config();
const crypto = require('crypto');
const orderModel = require('../models/order_model');

const createOrder = async (data) => {
    
    // generate unique ID for sync
    const uuid = crypto.randomUUID();
    const source = process.env.SERVER_NAME || 'Server-1';


    const orderPayload = {
        order_uuid: uuid,
        user_id: data.user_id,
        amount: data.amount,
        status: 'placed',
        source_server: source,
        synced: true 
    };

    try {
        await orderModel.createOrder(orderPayload);
        return orderPayload;
    } catch (err) {
        console.error("Error creating order:", err.message);
    }
};

const updateOrder = async (order_uuid,data) => {
    try {
        await orderModel.updateOrder(order_uuid,data);
        return data;
    } catch (err) {
        console.error("Error updating order:", err.message);
    }
};

module.exports = { createOrder };