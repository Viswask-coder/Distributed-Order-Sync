const database = require("../config/database");

const createOrder = async (data) => {
  // simple insert query
  const sql = `INSERT INTO orders (order_uuid, user_id, amount, status, source_server, synced) VALUES (?, ?, ?, ?, ?, ?)`;

  // console.log("DB Insert:", data.order_uuid); // debug

  const [result] = await database.execute(sql, [
    data.order_uuid,
    data.user_id,
    data.amount,
    data.status || "placed",
    data.source_server,
    data.synced !== undefined ? data.synced : true,
  ]);

  return result;
};

// Update an existing order
const updateOrder = async (uuid, data) => {
  // Check if updating status
  if (data.status && data.amount) {
    const sql = "UPDATE orders SET status = ?, amount = ? WHERE order_uuid = ?";
    const [result] = await database.execute(sql, [
      data.status,
      data.amount,
      uuid,
    ]);
    return result;
  } else if (data.status) {
    const sql = "UPDATE orders SET status = ? WHERE order_uuid = ?";
    const [result] = await database.execute(sql, [data.status, uuid]);
    return result;
  } else if (data.amount) {
    const sql = "UPDATE orders SET amount = ? WHERE order_uuid = ?";
    const [result] = await database.execute(sql, [data.amount, uuid]);
    return result;
  }
};

// Receive order from other server
const syncOrder = async (data) => {
  // If no user_id, it means this is an update
  if (!data.user_id) {
    // Update existing order
    if (data.status && data.amount) {
      const sql =
        "UPDATE orders SET status = ?, amount = ?, synced = 1 WHERE order_uuid = ?";
      await database.execute(sql, [data.status, data.amount, data.order_uuid]);
    } else if (data.status) {
      const sql =
        "UPDATE orders SET status = ?, synced = 1 WHERE order_uuid = ?";
      await database.execute(sql, [data.status, data.order_uuid]);
    } else if (data.amount) {
      const sql =
        "UPDATE orders SET amount = ?, synced = 1 WHERE order_uuid = ?";
      await database.execute(sql, [data.amount, data.order_uuid]);
    }
    console.log("Order updated:", data.order_uuid);
  } else {
    // New order - insert or update if exists
    const sql = `INSERT INTO orders (order_uuid, user_id, amount, status, source_server, synced) 
                     VALUES (?, ?, ?, ?, ?, ?) 
                     ON DUPLICATE KEY UPDATE status = ?, amount = ?, synced = 1`;

    await database.execute(sql, [
      data.order_uuid,
      data.user_id,
      data.amount,
      data.status,
      data.source_server,
      data.synced,
      data.status,
      data.amount,
    ]);
    console.log("Order synced:", data.order_uuid);
  }
};

const findByUuid = async (uuid) => {
  const [rows] = await database.execute(
    "SELECT * FROM orders WHERE order_uuid = ?",
    [uuid]
  );
  return rows[0];
};

module.exports = { createOrder, findByUuid, updateOrder, syncOrder };
