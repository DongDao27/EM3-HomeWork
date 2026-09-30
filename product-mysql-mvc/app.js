require('dotenv').config();

const path = require('path');
const express = require('express');
const methodOverride = require('method-override');
const db = require('./config/database');
const Product = require('./models/productModel');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.redirect('/products'));
app.use('/products', productRoutes);
app.use((req, res) => res.status(404).render('404'));
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render('error', { message: 'Khong the xu ly yeu cau. Vui long thu lai.' });
});

const start = async () => {
  await Product.testConnection();
  app.listen(PORT, () => console.log(`MySQL CRUD: http://localhost:${PORT}/products`));
};

start().catch(async (error) => {
  console.error('Khong the ket noi MySQL:', error.message);
  await db.end();
  process.exit(1);
});
