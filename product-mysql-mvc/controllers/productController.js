const Product = require('../models/productModel');

const validateProduct = (body) => {
  const product = {
    name: String(body.name || '').trim(),
    price: Number(body.price),
    description: String(body.description || '').trim(),
  };
  const errors = [];

  if (!product.name) errors.push('Ten san pham khong duoc de trong.');
  if (body.price === '' || !Number.isFinite(product.price) || product.price < 0) {
    errors.push('Gia phai la mot so khong am.');
  }

  return { product, errors };
};

exports.index = async (req, res, next) => {
  try {
    const products = await Product.findAll();
    res.render('products/index', { products });
  } catch (error) {
    next(error);
  }
};

exports.showCreateForm = (req, res) => {
  res.render('products/form', { product: {}, errors: [], isEditing: false });
};

exports.create = async (req, res, next) => {
  const { product, errors } = validateProduct(req.body);
  if (errors.length) {
    return res.status(422).render('products/form', { product, errors, isEditing: false });
  }

  try {
    await Product.create(product);
    return res.redirect('/products');
  } catch (error) {
    return next(error);
  }
};

exports.showEditForm = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).render('404');
    return res.render('products/form', { product, errors: [], isEditing: true });
  } catch (error) {
    return next(error);
  }
};

exports.update = async (req, res, next) => {
  const { product, errors } = validateProduct(req.body);
  product.id = req.params.id;
  if (errors.length) {
    return res.status(422).render('products/form', { product, errors, isEditing: true });
  }

  try {
    const updated = await Product.update(req.params.id, product);
    if (!updated) return res.status(404).render('404');
    return res.redirect('/products');
  } catch (error) {
    return next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const removed = await Product.remove(req.params.id);
    if (!removed) return res.status(404).render('404');
    return res.redirect('/products');
  } catch (error) {
    return next(error);
  }
};
