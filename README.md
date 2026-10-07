# Bài tập Node.js MVC

## DND Store — phiên bản mới

Ứng dụng quản lý sản phẩm gồm hai bản độc lập trong [`product-mvc`](product-mvc): MongoDB (cổng 3000) và MySQL XAMPP (cổng 3001). Có danh mục, tìm kiếm, CRUD, upload tối đa năm ảnh, thumbnails và popup chi tiết; giao diện có banner và footer.

- [Hướng dẫn cài đặt và thao tác database](product-mvc/README.md)
- [Giải thích code và luồng MVC](product-mvc/HUONG-DAN-HOC-VA-TRINH-BAY.md)
- [Thao tác và giải thích theo số dòng](product-mvc/GIAI-THICH-THEO-DONG.md)
- [Ảnh xem trước](product-mvc/preview/desktop.png)

Sao chép `.env.example` thành `.env`, cấu hình DB và chạy `npm install`, `npm start` trong thư mục phiên bản cần dùng. MySQL cài mới import `database.sql`; nâng cấp DB cũ xem phần migrations trong hướng dẫn.

## Các bài thực hành trước

- `product-mysql-mvc`: CRUD sản phẩm với MySQL, cổng 3001.
- `product-mongodb-mvc`: CRUD sản phẩm với MongoDB, cổng 3002.
- `square-mysql-mvc`: tính chu vi, diện tích hình vuông và lưu MySQL.
- `square-mvc`: tính chu vi, diện tích hình vuông và lưu MongoDB.

Các thư mục này có README và `.env.example` riêng. Khi chạy nhiều bài cùng lúc, cấu hình PORT khác nhau để tránh trùng cổng.
