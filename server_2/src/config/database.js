require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const database = pool.promise();

pool.getConnection((err, connection ) => {
    if (err){
        console.log('Database connection error',err);
        return;
    } else {
        console.log('Database connected');
        connection.release();
    }
});

module.exports = database; 