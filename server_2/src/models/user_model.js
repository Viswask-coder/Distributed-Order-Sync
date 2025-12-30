const db = require('../config/database');

//  new user 
const createUser = async (data) => {
    const sql = `INSERT INTO users (name, email) VALUES (?, ?)`;
    const [result] = await db.execute(sql, [data.name, data.email]);
    return result;
};

// Sync a user from the other server
const syncUser = async (data) => {
    const sql = `INSERT INTO users (id, name, email) VALUES (?, ?, ?)`;
    await db.execute(sql, [data.id, data.name, data.email]);
};

module.exports = { createUser, syncUser };