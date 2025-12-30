require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');
const orderModel = require('../models/order_model');

//  sync to other server
const triggerSync = async (data) => {
    try {
        const url = `${process.env.SERVER_URL}/orders/receive`;
        console.log(`Syncing to: ${url}`);
        const response = await axios.post(url, data);
        return response.data;
    } catch (error) {
        console.error("Failed to sync order:", error.message);
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
        }
        return null;
    }
}
const createOrder = async (data) => {
    
    
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

    await orderModel.createOrder(orderPayload);

    await triggerSync(orderPayload);

    return orderPayload;
};

const updateOrder = async (order_uuid,data) => {
    try {
        await orderModel.updateOrder(order_uuid,data);

        
        const payload = {
            order_uuid: order_uuid,
            status: data.status,
            amount: data.amount,
            source_server: process.env.SERVER_NAME || 'Server-1',
            synced: true
        };

        
        await triggerSync(payload);

        return data;
    } catch (err) {
        console.error("Error updating order:", err.message);
    }
};

module.exports = { createOrder, updateOrder };