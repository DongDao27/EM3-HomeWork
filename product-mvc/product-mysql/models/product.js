const { pool } = require('../config/database');

function toProduct(row) {
    row.images = row.images ? JSON.parse(row.images) : [row.image];
    return row;
}

exports.findAll = async (q, category) => {
    const escaped = q.replace(/[!%_]/g, '!$&');
    const conditions = [];
    const params = [];

    if (q) {
        conditions.push("name LIKE ? ESCAPE '!'");
        params.push(`%${escaped}%`);
    }
    if (category) {
        conditions.push('category = ?');
        params.push(category);
    }

    let sql = 'SELECT * FROM products';
    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY id DESC';

    const [rows] = await pool.execute(sql, params);
    return rows.map(toProduct);
};

exports.findById = async (id) => {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [
        id
    ]);
    return rows[0] ? toProduct(rows[0]) : null;
};

exports.create = async ({ name, price, quantity, image, images, category }) => {
    const [result] = await pool.execute(
        'INSERT INTO products (name, price, quantity, image, images, category) VALUES (?, ?, ?, ?, ?, ?)',
        [name, price, quantity, image, JSON.stringify(images), category]
    );
    return result.insertId;
};

exports.update = async (
    id,
    { name, price, quantity, image, images, category }
) => {
    await pool.execute(
        'UPDATE products SET name = ?, price = ?, quantity = ?, image = ?, images = ?, category = ? WHERE id = ?',
        [name, price, quantity, image, JSON.stringify(images), category, id]
    );
};

exports.remove = async (id) => {
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
};
