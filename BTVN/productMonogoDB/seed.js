const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/productModel');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    await Product.insertMany([
      { name: "Sample Women Top", price: 45, tag: "new", type: "new" },
      { name: "Sample Men Shirt", price: 55, type: "new" },
      { name: "Sample Jacket", price: 120, tag: "hot", type: "top" },
      { name: "Sample Shoes", price: 80, type: "top" }
    ]);

    console.log('Sample products inserted');
    await mongoose.disconnect();
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
