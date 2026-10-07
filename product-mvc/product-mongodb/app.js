require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/database');
const productRoutes = require('./routes/productRoutes');
const app = express();
fs.mkdirSync(path.join(__dirname, 'public/uploads'), { recursive: true });
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    '/bootstrap',
    express.static(path.join(__dirname, 'node_modules/bootstrap/dist'))
);
app.use('/', productRoutes);
app.use((req, res) =>
    res.status(404).render('error', { message: 'Không tìm thấy trang.' })
);
app.use(async (err, req, res, next) => {
    for (const file of req.files || []) {
        await fs.promises.unlink(file.path).catch(() => {});
    }
    console.error(err.message);
    const status = err.status || (err.name === 'MulterError' ? 400 : 500);
    let message = err.message;

    if (
        err.code === 'LIMIT_FILE_COUNT' ||
        err.code === 'LIMIT_UNEXPECTED_FILE'
    ) {
        message = 'Chỉ chọn tối đa 5 ảnh trong trường Ảnh.';
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'Mỗi ảnh phải nhỏ hơn hoặc bằng 2 MB.';
    }
    res.status(status).render('error', {
        message:
            status === 500
                ? 'Có lỗi database/server. Kiểm tra terminal.'
                : message
    });
});

async function start() {
    await connectDB();
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Mở http://localhost:${port}`);
    });
}
if (require.main === module) {
    start().catch((err) => {
        console.error(err.message);
        process.exit(1);
    });
}

module.exports = app;
