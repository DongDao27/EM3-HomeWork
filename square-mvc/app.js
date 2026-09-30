require('dotenv').config();

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const squareRoutes = require('./routes/squareRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', squareRoutes);

app.use((req, res) => {
  res.status(404).send('Không tìm thấy trang.');
});

const startServer = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('Thiếu biến MONGODB_URI trong tệp .env');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Đã kết nối MongoDB');

  app.listen(PORT, () => {
    console.log(`Ứng dụng đang chạy tại http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Không thể khởi động ứng dụng:', error.message);
  process.exit(1);
});
