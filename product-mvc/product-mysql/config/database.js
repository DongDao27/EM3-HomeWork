const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'productdb',
    charset: 'utf8mb4',
    connectionLimit: 5
});

async function connectDB() {
    await pool.query('SELECT 1');
    console.log('Đã kết nối MySQL');
}
module.exports = connectDB;
module.exports.pool = pool;
