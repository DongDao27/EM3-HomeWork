const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  tag: String,
  type: String
});

module.exports = mongoose.model('Product', productSchema);
