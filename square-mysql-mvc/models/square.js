const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const saveSquareData = async (sideLength, perimeter, area) => {
  const sql = `
    INSERT INTO squares (sideLength, perimeter, area)
    VALUES (?, ?, ?)
  `;
  const [result] = await pool.execute(sql, [sideLength, perimeter, area]);
  return result;
};

const testConnection = async () => {
  const connection = await pool.getConnection();
  connection.release();
};

module.exports = {
  saveSquareData,
  testConnection,
};
