const Product = require('../models/productModel');

exports.getHomePage = async (req, res) => {
  try {
    const newProducts = await Product.find({ type: 'new' });
    const topProducts = await Product.find({ type: 'top' });

    res.render('layout', { newProducts, topProducts });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading products");
  }
};
