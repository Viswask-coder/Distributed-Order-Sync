require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');
const orderModel = require('../models/order_model');

//  sync to other server
const triggerSync = async (data) => {
    const url = `${process.env.SERVER_URL}/orders/receive`;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            await axios.post(url, data, { timeout: 2000 }); // 2s timeout
            console.log(`Success on attempt ${attempt}`);
            return; // Exit if success
        } catch (e) {
            console.log(`Attempt ${attempt} failed: ${e.message}`);
            if (attempt < 3) await new Promise(r => setTimeout(r, 1000 * attempt)); // Wait for 1s, 2s
        }
    }

    // IF WE REACH HERE, ALL 3 FAILED.
    console.error(`All retries failed. Saving to DB.`);
    await orderModel.saveFailedSync(data, "Network Unreachable");
};
const createOrder = async (data) => {
    
    
    const uuid = crypto.randomUUID();
    const source = process.env.SERVER_NAME || 'Server-1';
    const now = Date.now(); // Capture timestamp for this order

    const orderPayload = {
        order_uuid: uuid,
        user_id: data.user_id,
        amount: data.amount,
        product_ids: data.product_ids, // Pass product_ids for auto-calculation
        status: 'placed',
        source_server: source,
        synced: true,
        updated_at: now // Include timestamp
    };

    // createOrder in model will auto-calculate amount if product_ids is provided
    const result = await orderModel.createOrder(orderPayload);

    // Use the calculated amount from the model result
    const syncPayload = {
        order_uuid: uuid,
        user_id: data.user_id,
        amount: result.finalAmount || data.amount,
        products: result.productDetails,
        status: 'placed',
        source_server: source,
        synced: true,
        updated_at: now // Include timestamp for sync
    };

    await triggerSync(syncPayload);

    return syncPayload;
};

const updateOrder = async (order_uuid, data) => {
    const now = Date.now(); // Capture Time for Conflict Resolution

    try {
        
        await orderModel.updateOrder(order_uuid, { ...data, updated_at: now });

        
        const payload = {
            order_uuid: order_uuid,
            status: data.status,
            amount: data.amount,
            source_server: process.env.SERVER_NAME || 'Server-1',
            updated_at: now, 
            synced: true
        };

        
        triggerSync(payload);

        return payload;
    } catch (err) {
        console.error("Error updating order:", err.message);
        throw err;
    }
};

module.exports = { createOrder, updateOrder };