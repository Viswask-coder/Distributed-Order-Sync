const db = require('../config/database');

//  new user 
const createUser = async (data) => {
    const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    const [result] = await db.execute(sql, [data.name, data.email, data.password]);
    return result;
};

// Find user by email
const findUserByEmail = async (email) => {
    const sql = "SELECT * FROM users WHERE email = ?";
    const [rows] = await db.execute(sql, [email]);
    return rows[0];
};

// Sync a user from the other server
const syncUser = async (data) => {
    const sql = `INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)`;
    await db.execute(sql, [data.id, data.name, data.email, data.password]);
};

module.exports = { createUser, syncUser, findUserByEmail };