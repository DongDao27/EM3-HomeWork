const { pool } = require('../config/database');

exports.findAll = async () => {
    const [rows] = await pool.execute(
        'SELECT name FROM categories ORDER BY name'
    );
    return [
        'Khác',
        ...rows.map((row) => row.name).filter((name) => name !== 'Khác')
    ];
};

exports.createOrFind = async (name) => {
    if (name.toLocaleLowerCase('vi-VN') === 'khác') {
        return 'Khác';
    }

    await pool.execute(
        'INSERT INTO categories (name) VALUES (?) ON DUPLICATE KEY UPDATE name = name',
        [name]
    );
    const [rows] = await pool.execute(
        'SELECT name FROM categories WHERE name = ?',
        [name]
    );
    return rows[0].name;
};
