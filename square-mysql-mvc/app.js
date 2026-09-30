require('dotenv').config();

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const squareRoutes = require('./routes/squareRoutes');
const squareModel = require('./models/square');

const app = express();
const PORT = process.env.PORT || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', squareRoutes);

app.use((req, res) => {
  res.status(404).send('Không tìm thấy trang.');
});

const startServer = async () => {
  await squareModel.testConnection();
  console.log(`Đã kết nối MySQL database ${process.env.DB_NAME}`);

  app.listen(PORT, () => {
    console.log(`Ứng dụng đang chạy tại http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Không thể khởi động ứng dụng:', error.message);
  process.exit(1);
});
