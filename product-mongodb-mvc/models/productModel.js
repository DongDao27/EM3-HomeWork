const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ten san pham khong duoc de trong.'],
      trim: true,
      maxlength: 150,
    },
    price: {
      type: Number,
      required: [true, 'Gia san pham khong duoc de trong.'],
      min: [0, 'Gia phai la mot so khong am.'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
