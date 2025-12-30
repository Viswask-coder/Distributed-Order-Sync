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

const updateOrder = async (uuid, data) => {
   
   const updates = [];
   const values = [];
   
   if (data.status !== undefined) {
       updates.push('status = ?');
       values.push(data.status);
   }
   
   if (data.amount !== undefined) {
       updates.push('amount = ?');
       values.push(data.amount);
   }
   
   if (updates.length === 0) {
       throw new Error('No fields to update');
   }
   
   const sql = `UPDATE orders SET ${updates.join(', ')} WHERE order_uuid = ?`;
   values.push(uuid);
   
   const [result] = await database.execute(sql, values);

   return result;
};

const syncOrder = async (data) => {
    
    if (!data.user_id) {
      
        const updates = [];
        const values = [];
        
        if (data.status !== undefined) {
            updates.push('status = ?');
            values.push(data.status);
        }
        
        if (data.amount !== undefined) {
            updates.push('amount = ?');
            values.push(data.amount);
        }
        
        // Always set synced = 1
        updates.push('synced = 1');
        
        const sql = `UPDATE orders SET ${updates.join(', ')} WHERE order_uuid = ?`;
        values.push(data.order_uuid);
        
        await database.execute(sql, values);
        console.log(`Updated order ${data.order_uuid}`);
    } else {
        const sql = `INSERT INTO orders (order_uuid, user_id, amount, status, source_server, synced) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status), amount = VALUES(amount), synced = 1`;
        await database.execute(sql, [
            data.order_uuid,
            data.user_id,
            data.amount,
            data.status,
            data.source_server,
            data.synced,
        ]);
        console.log(`order ${data.order_uuid}`);
    }
};

const findByUuid = async (uuid) => {
  const [rows] = await database.execute("SELECT * FROM orders WHERE order_uuid = ?", [
    uuid,
  ]);
  return rows[0];
};

module.exports = { createOrder, findByUuid, updateOrder, syncOrder };
