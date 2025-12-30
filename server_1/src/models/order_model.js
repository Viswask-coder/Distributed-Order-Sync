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

const updateOrder = async (data) => {
   const sql = `UPDATE orders SET status = ?, amount = ? WHERE order_uuid = ?`;
   
   const [result] = database.execute(sql, [
    data.status,
    data.amount,
    data.order_uuid,
   ])

   return result;
}

const findByUuid = async (uuid) => {
  const [rows] = await db.execute("SELECT * FROM orders WHERE order_uuid = ?", [
    uuid,
  ]);
  return rows[0];
};

module.exports = { createOrder, findByUuid, updateOrder };
