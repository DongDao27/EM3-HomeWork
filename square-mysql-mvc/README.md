# Bài tập tính hình vuông với MySQL/XAMPP

Ứng dụng Express theo mô hình MVC, dùng EJS làm giao diện và MySQL/MariaDB của XAMPP để lưu kết quả.

## Cấu trúc

```text
square-mysql-mvc/
├── controllers/
│   └── squareController.js
├── models/
│   └── square.js
├── routes/
│   └── squareRoutes.js
├── views/
│   └── index.ejs
├── app.js
├── database.sql
├── package.json
└── .env
```

## Chạy ứng dụng

1. Khởi động MySQL trong XAMPP.
2. Nếu chưa có database và bảng, import tệp `database.sql` trong phpMyAdmin.
3. Chạy `npm install`.
4. Chạy `npm start`.
5. Mở <http://localhost:3001>.

Kết quả được lưu tại database `Square`, bảng `squares`. Sau khi tính, vào phpMyAdmin và nhấn **Browse** hoặc **Refresh** để xem dữ liệu.
