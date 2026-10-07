const Product = require('../models/product');
const Category = require('../models/category');
const fs = require('fs/promises');
const path = require('path');

function badRequest(message) {
    const error = new Error(message);
    error.status = 400;
    throw error;
}

function readForm(body) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const price = Number(body.price);
    const quantity = Number(body.quantity);

    if (!name || name.length > 100) {
        badRequest('Tên sản phẩm phải có từ 1 đến 100 ký tự.');
    }

    if (typeof body.price !== 'string' || !body.price.trim()) {
        badRequest('Vui lòng nhập giá sản phẩm.');
    }

    if (!Number.isFinite(price) || price < 0 || price > 9999999999.99) {
        badRequest('Giá phải là số từ 0 đến 9.999.999.999,99.');
    }

    if (typeof body.quantity !== 'string' || !body.quantity.trim()) {
        badRequest('Vui lòng nhập số lượng.');
    }

    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 2147483647) {
        badRequest('Số lượng phải là số nguyên từ 0 đến 2.147.483.647.');
    }

    return {
        name,
        price: Math.round(price * 100) / 100,
        quantity
    };
}

async function findProduct(id) {
    const validId =
        /^[1-9][0-9]*$/.test(id) && Number.isSafeInteger(Number(id));

    if (!validId) {
        badRequest('ID sản phẩm không hợp lệ.');
    }

    const product = await Product.findById(id);

    if (!product) {
        const error = new Error('Không tìm thấy sản phẩm.');
        error.status = 404;
        throw error;
    }

    return product;
}

async function removeImage(image) {
    if (!image || !image.startsWith('/uploads/')) {
        return;
    }

    const filename = path.basename(image);
    const filePath = path.join(__dirname, '../public/uploads', filename);

    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error('Không xóa được ảnh:', error.message);
        }
    }
}

async function removeProductImages(product) {
    const images =
        product.images && product.images.length > 0
            ? product.images
            : [product.image];

    for (const image of new Set(images)) {
        await removeImage(image);
    }
}

async function readCategory(body) {
    const newCategory =
        typeof body.newCategory === 'string' ? body.newCategory.trim() : '';
    const category =
        typeof body.category === 'string' ? body.category.trim() : 'Khác';

    if (newCategory) {
        if (newCategory.length > 80) {
            badRequest('Tên danh mục tối đa 80 ký tự.');
        }
        return Category.createOrFind(newCategory);
    }

    const categories = await Category.findAll();
    if (!categories.includes(category)) {
        badRequest('Vui lòng chọn danh mục có sẵn hoặc nhập danh mục mới.');
    }
    return category;
}

exports.getAllProducts = async (req, res) => {
    const q =
        typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
    const categories = await Category.findAll();
    const category =
        typeof req.query.category === 'string' ? req.query.category.trim() : '';

    if (category && !categories.includes(category)) {
        badRequest('Danh mục không tồn tại.');
    }

    const products = await Product.findAll(q, category);
    res.render('index', { products, q, categories, category });
};

exports.showAddProductForm = async (req, res) => {
    const categories = await Category.findAll();
    res.render('add', { categories });
};

exports.addProduct = async (req, res) => {
    const data = readForm(req.body);

    if (!req.files || req.files.length === 0) {
        badRequest('Vui lòng chọn ảnh sản phẩm.');
    }

    data.category = await readCategory(req.body);
    data.images = req.files.map((file) => `/uploads/${file.filename}`);
    data.image = data.images[0];
    await Product.create(data);
    res.redirect('/');
};

exports.showEditProductForm = async (req, res) => {
    const product = await findProduct(req.params.id);
    const categories = await Category.findAll();
    res.render('edit', { product, categories });
};

exports.updateProduct = async (req, res) => {
    const product = await findProduct(req.params.id);
    const data = readForm(req.body);
    data.category = await readCategory(req.body);
    data.image = product.image;
    data.images = product.images || [product.image];

    if (req.files && req.files.length > 0) {
        data.images = req.files.map((file) => `/uploads/${file.filename}`);
        data.image = data.images[0];
    }

    await Product.update(req.params.id, data);

    if (req.files && req.files.length > 0) {
        await removeProductImages(product);
    }

    res.redirect('/');
};

exports.deleteProduct = async (req, res) => {
    const product = await findProduct(req.params.id);
    await Product.remove(req.params.id);
    await removeProductImages(product);
    res.redirect('/');
};

exports.showProductDetail = async (req, res) => {
    const product = await findProduct(req.params.id);
    res.render('show', { product });
};
