const mongoose = require('mongoose');
const schema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        category: { type: String, trim: true, maxlength: 80, default: 'Khác' },
        price: { type: Number, required: true, min: 0 },
        quantity: {
            type: Number,
            required: true,
            min: 0,
            validate: Number.isInteger
        },
        image: { type: String, required: true },
        images: { type: [String], default: [] }
    },
    { timestamps: true }
);
const Product = mongoose.model('Product', schema);

function toProduct(doc) {
    doc.id = String(doc._id);
    doc.category = doc.category || 'Khác';
    return doc;
}

exports.findAll = async (q, category) => {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let filter = {};

    if (q) {
        filter = { name: { $regex: escaped, $options: 'i' } };
    }

    if (category === 'Khác') {
        filter.$or = [
            { category: 'Khác' },
            { category: null },
            { category: '' }
        ];
    } else if (category) {
        filter.category = category;
    }

    const rows = await Product.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .lean();
    return rows.map(toProduct);
};

exports.findById = async (id) => {
    const doc = await Product.findById(id).lean();
    if (!doc) {
        return null;
    }

    return toProduct(doc);
};

exports.create = (data) => {
    return Product.create(data);
};

exports.update = (id, data) => {
    return Product.findByIdAndUpdate(id, data, { runValidators: true });
};

exports.remove = (id) => {
    return Product.findByIdAndDelete(id);
};
