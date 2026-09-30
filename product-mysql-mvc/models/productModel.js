const db = require('../config/database');

const Product = {
  async findAll() {
    const [rows] = await db.execute('SELECT * FROM products ORDER BY id DESC');
    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create({ name, price, description }) {
    const [result] = await db.execute(
      'INSERT INTO products (name, price, description) VALUES (?, ?, ?)',
      [name, price, description || null]
    );
    return result.insertId;
  },

  async update(id, { name, price, description }) {
    const [result] = await db.execute(
      'UPDATE products SET name = ?, price = ?, description = ? WHERE id = ?',
      [name, price, description || null, id]
    );
    return result.affectedRows > 0;
  },

  async remove(id) {
    const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async testConnection() {
    await db.query('SELECT 1');
  },
};

module.exports = Product;
