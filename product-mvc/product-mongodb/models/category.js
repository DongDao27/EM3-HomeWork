const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 80 },
    key: { type: String, required: true, unique: true }
});

const Category = mongoose.model('Category', schema);

exports.findAll = async () => {
    const rows = await Category.find().sort({ name: 1 }).lean();
    return [
        'Khác',
        ...rows.map((row) => row.name).filter((name) => name !== 'Khác')
    ];
};

exports.createOrFind = async (name) => {
    const key = name.toLocaleLowerCase('vi-VN');
    if (key === 'khác') {
        return 'Khác';
    }

    const existing = await Category.findOne({ key }).lean();
    if (existing) {
        return existing.name;
    }

    try {
        const category = await Category.create({ name, key });
        return category.name;
    } catch (error) {
        if (error.code !== 11000) {
            throw error;
        }
        const category = await Category.findOne({ key }).lean();
        return category.name;
    }
};
