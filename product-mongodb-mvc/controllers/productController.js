const mongoose = require('mongoose');
const Product = require('../models/productModel');

const productFromBody = (body) => ({
  name: String(body.name || '').trim(),
  price: body.price === '' ? null : Number(body.price),
  description: String(body.description || '').trim(),
});

const validationMessages = (error) => {
  if (error.name !== 'ValidationError') return null;
  return Object.values(error.errors).map((item) => item.message);
};

exports.index = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    res.render('products/index', { products });
  } catch (error) {
    next(error);
  }
};

exports.showCreateForm = (req, res) => {
  res.render('products/form', { product: {}, errors: [], isEditing: false });
};

exports.create = async (req, res, next) => {
  const product = productFromBody(req.body);
  try {
    await Product.create(product);
    res.redirect('/products');
  } catch (error) {
    const errors = validationMessages(error);
    if (errors) return res.status(422).render('products/form', { product, errors, isEditing: false });
    return next(error);
  }
};

exports.showEditForm = async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).render('404');
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).render('404');
    return res.render('products/form', { product, errors: [], isEditing: true });
  } catch (error) {
    return next(error);
  }
};

exports.update = async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).render('404');
  const product = { ...productFromBody(req.body), _id: req.params.id };
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, product, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).render('404');
    return res.redirect('/products');
  } catch (error) {
    const errors = validationMessages(error);
    if (errors) return res.status(422).render('products/form', { product, errors, isEditing: true });
    return next(error);
  }
};

exports.remove = async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).render('404');
  try {
    const removed = await Product.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).render('404');
    return res.redirect('/products');
  } catch (error) {
    return next(error);
  }
};
