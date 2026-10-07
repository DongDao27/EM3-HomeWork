# DND Store — MongoDB và MySQL XAMPP

Hai dự án Node.js MVC độc lập, dành cho Advanced Web Design. Đọc [Giải thích code hiện tại](HUONG-DAN-HOC-VA-TRINH-BAY.md) để biết thứ tự tạo file, từng hàm và kịch bản trình bày.

## Giao diện và chức năng

Header trắng DND Store, banner quảng cáo lớn và sản phẩm bên dưới, theo bố cục lấy cảm hứng từ ảnh tham khảo Nike. Tìm kiếm và nút thêm nằm cạnh nhau khi đủ chỗ. Card có viền mảnh, ảnh đầy đủ, thumbnails và hai icon sửa/xóa. Bấm thumbnail để đổi ảnh, không có mũi tên. Mua ngay mở popup chi tiết, không chuyển trang và chưa đặt hàng/thanh toán.

Font Noto Sans được đóng gói local. Card dùng contain để giữ toàn bộ ảnh; ảnh khác tỷ lệ khung có thể có khoảng trống. Bootstrap cũng được phục vụ local sau npm install.

## 1. Chuẩn bị

Cài Node.js hỗ trợ yêu cầu trong package.json (tối thiểu 20.19), npm, VS Code và DB cho phiên bản muốn chạy. Kiểm tra node -v, npm -v trong terminal.

| Bản | Thư mục | Web | DB |
|---|---|---|---|
| MongoDB | product-mongodb | http://localhost:3000 | 127.0.0.1:27017/productdb |
| MySQL | product-mysql | http://localhost:3001 | 127.0.0.1:3306/productdb |

Không cần đặt code trong htdocs. Express chạy bằng Node.js. Với XAMPP, MySQL/MariaDB lưu dữ liệu, Apache phục vụ phpMyAdmin.

## 2. Chạy MongoDB

1. Cài/chạy MongoDB Community Server. Compass chỉ là công cụ quản lý, không thay thế server.
2. Mở terminal tại product-mvc:

```bash
cd product-mongodb
npm install
```

3. Sao chép .env.example thành .env. Có thể dùng VS Code, CMD `copy .env.example .env` hoặc Bash `cp .env.example .env`.

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/productdb
```

4. Chạy npm start, mở http://localhost:3000. URI này dùng cho MongoDB cùng máy, không yêu cầu xác thực. Nếu cấu hình xác thực, dùng URI phù hợp tài khoản của bạn.
5. Thêm sản phẩm kèm ảnh. Database productdb và collection products được tạo khi ghi lần đầu.

### Compass

New Connection → mongodb://127.0.0.1:27017 → Connect. Tên kết nối “App” là tên hiển thị, không phải tên database.

Sau khi lưu trên web: Refresh → productdb → products → Documents. Kiểm tra name/price/quantity, image và array images. Sản phẩm ba ảnh phải có ba đường dẫn trong images.

Filter tìm tên:

```javascript
{ "name": { "$regex": "chuột", "$options": "i" } }
```

Edit Document → sửa quantity → Update → tải lại web. Add Data → Insert Document có thể thêm bằng tay, nhưng nên thêm qua web để ảnh/validation đúng. Sửa trực tiếp DB không chạy controller/Mongoose validation.

Thùng rác xóa document không tự dọn ảnh. Khi demo, xóa qua web để controller dọn files.

### mongosh (tùy chọn)

```javascript
use productdb
db.products.find()
db.products.find({ name: /chuột/i })
db.products.updateOne({ _id: ObjectId("THAY_ID_THAT") }, { $set: { quantity: 20 } })
db.products.deleteOne({ _id: ObjectId("THAY_ID_THAT") })
```

Lệnh cuối chỉ dùng dữ liệu thử, không tự xóa file ảnh.

## 3. Chạy MySQL XAMPP

1. Trong XAMPP Start MySQL; Start Apache để mở http://localhost/phpmyadmin. Nếu đổi cổng Apache, thêm cổng vào URL.
2. Cài mới: phpMyAdmin → Import → chọn product-mysql/database.sql → Go. File tạo DB/bảng nếu chưa có, không xóa dữ liệu cũ.
3. Mở terminal tại product-mvc:

```bash
cd product-mysql
npm install
```

4. Sao chép .env.example thành .env:

```env
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=productdb
```

Điền mật khẩu thật nếu root đã có mật khẩu. Nếu DB chạy 3307, đổi DB_PORT. Chạy npm start, mở http://localhost:3001.

### Nâng cấp bảng cũ từ bản một ảnh

Nếu bảng products đã có nhưng chưa có cột images, chạy migrations/001-product-images.sql một lần trong tab SQL:

```sql
USE productdb;
ALTER TABLE products ADD COLUMN images TEXT NULL AFTER image;
```

Cài mới bằng database.sql hiện tại thì không chạy migration. Duplicate column name nghĩa là cột đã có. Image cũ được giữ; gallery có thể dùng ảnh cũ. MongoDB không cần migration.

### phpMyAdmin và SQL

Chọn productdb → products → Browse xem dữ liệu; Structure xem kiểu và khóa chính. images chứa JSON array các đường dẫn, không phải file ảnh. Edit sửa số lượng → Go → tải lại web. Search name với LIKE và %chuột% để tìm.

```sql
SELECT * FROM products ORDER BY id DESC;
SELECT * FROM products WHERE name LIKE '%chuột%';
UPDATE products SET quantity = 20 WHERE id = 1;
DELETE FROM products WHERE id = 1;
```

Thay 1 bằng ID thử thực tế. Xóa trực tiếp SQL không dọn ảnh. Export → Quick → SQL để sao lưu DB; sao lưu thêm public/uploads.

## 4. Chọn và sửa nhiều ảnh

Giữ Ctrl trên Windows/Linux hoặc Command trên macOS để chọn cùng lúc tối đa năm ảnh trong hộp file. Mỗi ảnh JPG/PNG/WEBP tối đa 2 MB. Form báo số ảnh và hiển thị preview trước khi lưu. Chọn lại file thay lựa chọn trước, không tự cộng dồn.

Ảnh đầu là ảnh chính. Một ảnh không có hàng thumbnails; nhiều ảnh có thumbnails trong card/popup. Sửa không chọn ảnh mới giữ bộ cũ. Chọn bộ mới thay toàn bộ bộ cũ; ghi DB thành công rồi dọn các file cũ. Xóa sản phẩm dọn tất cả ảnh.

Nếu ba ảnh báo quá nhiều file: Ctrl+C dừng server, thay đủ bản code mới, giữ .env/public/uploads, chạy lại npm start từ đúng thư mục. Middleware phải files: 5, route thêm/sửa phải upload.array('image', 5). Kiểm tra form báo Đã chọn 3 ảnh, DB images có ba phần tử.

## 5. Cấu trúc

```text
product-mongodb/ hoặc product-mysql/
├── app.js
├── config/database.js
├── models/product.js
├── controllers/productController.js
├── routes/productRoutes.js
├── middleware/upload.js
├── views/
│   ├── index.ejs, add.ejs, edit.ejs, show.ejs, error.ejs
│   └── partials/
│       ├── header.ejs, footer.ejs, fields.ejs
│       ├── gallery.ejs, productPopup.ejs
├── public/
│   ├── css/style.css
│   ├── js/gallery.js, productPopup.js, imagePreview.js
│   ├── fonts/ (Noto Sans và giấy phép)
│   └── uploads/
├── .env.example
├── package.json
└── package-lock.json
```

MySQL có thêm database.sql và migrations/001-product-images.sql. Mỗi bản tự chạy, không phụ thuộc bản kia. File giải thích và ảnh preview nằm ngoài hai thư mục dự án.

## 6. Lỗi thường gặp

- ECONNREFUSED: DB chưa chạy hoặc sai cổng; kiểm tra service MongoDB/XAMPP và .env.
- Access denied: sai tài khoản/mật khẩu MySQL.
- Unknown database/Table doesn't exist: import database.sql.
- Unknown column images: bảng cũ chưa chạy migration.
- EADDRINUSE: dừng tiến trình chiếm cổng hoặc đổi PORT.
- Font/CSS cũ: Ctrl+F5; giữ nguyên public/fonts và kiểm tra tải đủ bộ code.
- Ảnh mất: kiểm tra public/uploads và đường dẫn DB. Import DB không khôi phục file ảnh.
- Sửa .env/code server: Ctrl+C rồi npm start lại.

## 7. Phạm vi và tài liệu

Bài chạy local, chưa có tài khoản, phân quyền, CSRF, giỏ hàng, đơn hàng hoặc thanh toán. MIME ảnh do client gửi, chưa xác minh bằng giải mã. DB và file không cùng transaction. Giá MongoDB dùng Number phù hợp minh họa, chưa dùng cho kế toán chính xác. Các phần giải thích và kiểm thử để trình bày nằm trong tài liệu học.

Tài liệu tham khảo: [Express/Multer](https://expressjs.com/en/resources/middleware/multer/), [Mongoose](https://mongoosejs.com/docs/connections.html), [MySQL2](https://sidorares.github.io/node-mysql2/docs), [XAMPP](https://www.apachefriends.org/faq_windows.html), [Compass](https://www.mongodb.com/docs/compass/current/).

## Banner trang chủ

Ảnh nằm trong public/images/banner-headphones.png của mỗi bản. Muốn đổi banner, thay file ảnh tại đường dẫn đó hoặc sửa src trong views/index.ejs. Chữ và nút là HTML, không nằm trong ảnh. Nút Khám phá sản phẩm dẫn tới #products trên cùng trang. Banner chỉ hiện khi không có từ khóa tìm để kết quả tìm kiếm nằm ngay đầu phần nội dung.

Banner dùng cover để phủ vùng quảng cáo; ảnh sản phẩm vẫn dùng contain/height auto để không cắt ảnh. Màu giao diện hiện là đen–trắng. Header vẫn DND Store, không dùng logo Nike; không thêm menu danh mục, giỏ hàng hoặc thanh toán chưa có chức năng.

## Danh mục và footer — phiên bản DND Store

Tên cửa hàng là DND Store trong header, title và footer. Footer chỉ có tên cửa hàng, liên kết sản phẩm và năm bản quyền.

Chọn danh mục trong form thêm/sửa. Nếu nhập Danh mục mới, ứng dụng tạo (hoặc dùng danh mục trùng tên đã có) và gán danh mục đó cho sản phẩm, ưu tiên hơn lựa chọn trong dropdown. Tối đa 80 ký tự. Không nhập mới thì dùng danh mục đã chọn. Mặc định Khác.

Danh mục lưu trong collection categories của MongoDB hoặc bảng categories của MySQL; products lưu tên danh mục trong category. Chọn chip danh mục trên danh sách để lọc; từ khóa và danh mục có thể dùng cùng lúc. Banner ẩn khi đang lọc. Xóa sản phẩm không xóa danh mục nên có thể dùng lại.

**MySQL đã có bảng:** chạy migrations/002-product-categories.sql một lần trong phpMyAdmin → productdb → SQL. File thêm products.category (mặc định Khác) và tạo bảng categories. Nếu cài mới bằng database.sql hiện tại, không chạy migration này. Nếu chưa có images, chạy migration 001 trước. Kiểm tra Structure để tránh thêm cột hai lần.

**MongoDB:** không cần migration, sản phẩm cũ không có category được hiển thị/lọc dưới Khác. Khi tạo danh mục, collection categories được ghi tự động.

### Banner hiện tại do người dùng cung cấp

Banner dùng public/images/banner-sneakers-hd.png (sao chép từ download.jpeg). Ảnh giữ tỷ lệ gốc bằng width: 100%, height: auto, không có chữ HTML hoặc lớp tối phủ lên. Bản JPEG gốc 270×148 được giữ lại; website dùng bản PNG phục dựng 1694×928 để tránh kéo giãn ảnh nhỏ. Muốn thay tiếp, đổi src của banner trong index.ejs hoặc thay file tương ứng.

Xem [Giải thích theo số dòng](GIAI-THICH-THEO-DONG.md) cho thao tác thêm/sửa/xóa, danh mục, nhiều ảnh, popup và thay banner. Các số dòng được đối chiếu với code hiện tại.

### Sửa banner bị vỡ

Ảnh gốc 270×148 không đủ độ phân giải cho banner desktop. Website hiện dùng public/images/banner-sneakers-hd.png, bản phục dựng bằng image_gen 1694×928. Giữ JPEG gốc trong thư mục để đối chiếu. Khung banner cao tối đa 560px; contain giữ toàn bộ bố cục và chữ, nền tối lấp phần dư hai bên. Đây là bản phục dựng bằng AI, không khôi phục chính xác mọi chi tiết từ ảnh nhỏ. Sau khi thay file, Ctrl+F5 để bỏ cache.
