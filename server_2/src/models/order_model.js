const database = require("../config/database");
const logger = require("../utils/logger");

const MENU = [ 
    {id:1, name: " Biriyani", price: 120.00 },
    {id:2, name: " Parotta", price: 250.00 },
    {id:3, name: "Potato Fries", price: 80.00 },
    {id:4, name: "Coke",    price: 40.00 },
    {id:5, name: "Vanilla Ice",  price: 60.00 }
];

const createOrder = async (data) => {
    let finalAmount = data.amount || 0;
    let productDetails = data.products || [];

    // 1. AUTOMATIC CALCULATOR LOGIC
    // Only calculate if product_ids is provided AND we don't already have products from sync
    if (data.product_ids && Array.isArray(data.product_ids) && (!data.products || data.products.length === 0)) {
        finalAmount = 0;
        productDetails = [];

        data.product_ids.forEach(id => {
            const product = MENU.find(item => item.id === id);
            if (product) {
                finalAmount += product.price;
                productDetails.push(product);
            }
        });
    }

    // Convert timestamp to MySQL DATETIME format
    const now = data.updated_at 
        ? (typeof data.updated_at === 'number' 
            ? new Date(data.updated_at).toISOString().slice(0, 19).replace('T', ' ')
            : data.updated_at)
        : new Date().toISOString().slice(0, 19).replace('T', ' ');

    // 2. INSERT (Added updated_at)
    const sql = `INSERT INTO orders (order_uuid, user_id, amount, status, source_server, synced, updated_at, products) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await database.execute(sql, [
        data.order_uuid,
        data.user_id,
        finalAmount,
        data.status || "placed",
        data.source_server,
        data.synced !== undefined ? data.synced : true,
        now, // MySQL DATETIME format
        JSON.stringify(productDetails)
    ]);

    return { result, finalAmount, productDetails };
};

// Update an existing order (Local Update)
const updateOrder = async (uuid, data) => {
    // Convert timestamp to MySQL DATETIME format
    const now = new Date().toISOString().slice(0, 19).replace('T', ' '); 

    if (data.status && data.amount) {
        const sql = "UPDATE orders SET status = ?, amount = ?, updated_at = ? WHERE order_uuid = ?";
        const [result] = await database.execute(sql, [data.status, data.amount, now, uuid]);
        return result;
    } else if (data.status) {
        const sql = "UPDATE orders SET status = ?, updated_at = ? WHERE order_uuid = ?";
        const [result] = await database.execute(sql, [data.status, now, uuid]);
        return result;
    } else if (data.amount) {
        const sql = "UPDATE orders SET amount = ?, updated_at = ? WHERE order_uuid = ?";
        const [result] = await database.execute(sql, [data.amount, now, uuid]);
        return result;
    }
};

// Receive order from other server (Sync)
const syncOrder = async (data) => {
    // 1. Fetch existing order to check for conflicts
    const [existing] = await database.execute(
        "SELECT * FROM orders WHERE order_uuid = ?",
        [data.order_uuid]
    );
    const currentOrder = existing[0];

    // 2. Conflict Resolution
    // If we have data, and local timestamp is NEWER than incoming, ignore incoming.
    if (currentOrder && data.updated_at && currentOrder.updated_at > data.updated_at) {
        logger.warn(
            `CONFLICT: Ignored stale update for Order ${data.order_uuid}. ` +
            `Incoming: ${data.updated_at}, Local: ${currentOrder.updated_at}`
        );
        return; // STOP HERE
    }

    // 3. PREPARE DATA
    const productsJson = data.products ? JSON.stringify(data.products) : null;
    
    // Convert timestamp to MySQL DATETIME format
    // Use the INCOMING timestamp if available, otherwise use current time
    const eventTime = data.updated_at 
        ? (typeof data.updated_at === 'number' 
            ? new Date(data.updated_at).toISOString().slice(0, 19).replace('T', ' ')
            : data.updated_at)
        : new Date().toISOString().slice(0, 19).replace('T', ' '); 

    if (!data.user_id) {
        // --- PARTIAL UPDATE ---
        if (data.status && data.amount) {
            const sql = "UPDATE orders SET status = ?, amount = ?, synced = 1, updated_at = ? WHERE order_uuid = ?";
            await database.execute(sql, [data.status, data.amount, eventTime, data.order_uuid]);
        
        } else if (data.status) {
            const sql = "UPDATE orders SET status = ?, synced = 1, updated_at = ? WHERE order_uuid = ?";
            await database.execute(sql, [data.status, eventTime, data.order_uuid]);
        
        } else if (data.amount) {
            const sql = "UPDATE orders SET amount = ?, synced = 1, updated_at = ? WHERE order_uuid = ?";
            await database.execute(sql, [data.amount, eventTime, data.order_uuid]);
        }
    } else {
        // --- FULL UPSERT ---
        const sql = `
            INSERT INTO orders (order_uuid, user_id, amount, status, source_server, synced, updated_at, products) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
                status = VALUES(status), 
                amount = VALUES(amount), 
                synced = 1,
                updated_at = VALUES(updated_at),
                products = VALUES(products)
        `;

        await database.execute(sql, [
            data.order_uuid,
            data.user_id,
            data.amount,
            data.status,
            data.source_server,
            data.synced,
            eventTime,     // Use the incoming time
            productsJson   // Use the incoming products
        ]);
    }
    console.log(`[Sync] Processed update for ${data.order_uuid}`);
};

// Save failed sync to DB for later retry
const saveFailedSync = async (payload, errorMsg) => {
    const sql = `INSERT INTO failed_syncs (payload, error_msg) VALUES (?, ?)`;
    await database.execute(sql, [JSON.stringify(payload), errorMsg]);
};

const findByUuid = async (uuid) => {
    const [rows] = await database.execute(
        "SELECT * FROM orders WHERE order_uuid = ?",
        [uuid]
    );
    return rows[0];
};

module.exports = { createOrder, findByUuid, updateOrder, syncOrder, saveFailedSync };