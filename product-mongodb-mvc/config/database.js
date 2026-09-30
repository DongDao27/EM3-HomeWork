const mongoose = require('mongoose');

const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/product_crud';
  await mongoose.connect(uri);
  console.log('Da ket noi MongoDB');
};

module.exports = connectDatabase;
