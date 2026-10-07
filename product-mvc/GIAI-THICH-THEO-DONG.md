# DND Store — Thao tác và giải thích theo dòng

Các số dòng dưới đây được đối chiếu với code hiện tại. Phần chính dùng `product-mongodb`, vì bạn đang chạy MongoDB. Bản MySQL có bảng đối chiếu model ở cuối. Số dòng có thể thay đổi nếu bạn thêm/xóa dòng trong file.

Trong VS Code, mở file rồi nhấn Ctrl+G, nhập số dòng để tới đúng vị trí. Muốn xem số dòng: View → Appearance → Show Line Numbers.

## 1. Thêm sản phẩm

### Thao tác

1. Mở http://localhost:3000, bấm Thêm sản phẩm.
2. Nhập tên, giá và số lượng.
3. Chọn danh mục có sẵn hoặc nhập Danh mục mới. Nếu nhập mới thì tên mới được ưu tiên.
4. Giữ Ctrl và chọn cùng lúc hai/ba ảnh JPG, PNG hoặc WEBP. Mỗi file tối đa 2 MB, tổng tối đa năm ảnh.
5. Kiểm tra dòng Đã chọn ... ảnh và ảnh xem trước, nhấn Lưu.
6. Trang chuyển về danh sách. Trong Compass, productdb → products có sản phẩm mới; danh mục mới nằm ở collection categories.

### File và dòng

| File | Dòng | Vai trò |
|---|---|---|
| views/index.ejs | 25 | Liên kết mở /add |
| routes/productRoutes.js | 6 | GET /add gọi showAddProductForm |
| controllers/productController.js | 125–128 | Lấy danh mục và render add |
| views/add.ejs | 5–11 | Form POST /add có multipart/form-data |
| views/partials/fields.ejs | 1–45 | Các trường nhập dùng chung |
| routes/productRoutes.js | 7 | Multer nhận ảnh rồi gọi addProduct |
| middleware/upload.js | 9–27 | Nơi lưu, tên file, giới hạn và loại file |
| controllers/productController.js | 130–142 | Thêm sản phẩm |
| models/product.js | 59–61 | Mongoose ghi DB |

addProduct: dòng 131 gọi readForm; 133–135 yêu cầu có ảnh; 137 chọn/tạo danh mục; 138 chuyển req.files thành array đường dẫn; 139 chọn ảnh đầu làm image; 140 await Product.create; 141 redirect về danh sách.

readForm ở controller 12–42 kiểm tra tên/giá/số lượng. req.body chứa chữ/số gửi từ form; req.files chứa thông tin file Multer nhận. Input number gửi chuỗi nên Number(...) chuyển thành số. Giá âm, số lượng lẻ, tên rỗng bị từ chối.

Luồng: add.ejs → POST /add → Multer → addProduct → Product.create → MongoDB → redirect / → getAllProducts → index.ejs.

## 2. Sửa sản phẩm

### Thao tác

Bấm icon bút ở card → sửa tên/giá/số lượng/danh mục → Lưu. Không chọn ảnh mới thì giữ bộ ảnh cũ. Chọn ảnh mới thì thay toàn bộ bộ cũ, không cộng thêm. Nhập Danh mục mới cũng được ưu tiên hơn dropdown như lúc thêm.

| File | Dòng | Vai trò |
|---|---|---|
| views/index.ejs | 51–53 | Icon bút dẫn tới /edit/id |
| routes/productRoutes.js | 8 | GET mở form sửa |
| controllers/productController.js | 144–148 | Tìm sản phẩm, lấy danh mục, render edit |
| views/edit.ejs | 5–11 | Form POST theo ID |
| views/partials/fields.ejs | 3, 11, 24, 28 | Điền lại tên/danh mục/giá/số lượng |
| views/partials/fields.ejs | 38–44 | Hiển thị bộ ảnh đang lưu |
| routes/productRoutes.js | 9 | Upload tùy chọn rồi updateProduct |
| controllers/productController.js | 150–169 | Xử lý cập nhật |
| models/product.js | 63–65 | findByIdAndUpdate |

updateProduct: 151 tìm sản phẩm cũ; 152–153 kiểm tra dữ liệu/danh mục; 154–155 giữ đường dẫn cũ; 157–160 chỉ thay bộ ảnh nếu có file mới; 162 ghi DB; 164–166 dọn bộ cũ sau khi ghi thành công; 168 về danh sách.

findProduct ở controller 44–60 kiểm tra ID và sản phẩm tồn tại. ID sai trả 400, ID hợp lệ nhưng không tìm thấy trả 404. Model update dùng runValidators: true để kiểm tra schema khi sửa.

Không xóa ảnh cũ trước khi cập nhật DB: nếu DB thất bại, ảnh cũ còn dùng được. Ảnh mới được middleware lỗi dọn khi lưu thất bại.

## 3. Xóa sản phẩm

### Thao tác

Bấm icon thùng rác → hộp xác nhận. Cancel giữ nguyên; OK gửi yêu cầu xóa. Khi thành công, bản ghi sản phẩm và các file ảnh của nó được xóa. Danh mục không bị xóa.

| File | Dòng | Vai trò |
|---|---|---|
| views/index.ejs | 54–58 | Form POST, confirm và icon xóa |
| routes/productRoutes.js | 10 | POST /delete/:id |
| controllers/productController.js | 171–176 | Xóa sản phẩm và ảnh |
| models/product.js | 67–69 | findByIdAndDelete |
| controllers/productController.js | 79–88 | Dọn toàn bộ bộ ảnh |
| controllers/productController.js | 62–77 | Xóa từng file bằng fs.unlink |

deleteProduct: 172 tìm sản phẩm; 173 xóa DB; 174 dọn file; 175 redirect. removeProductImages lấy images hoặc image cũ, dùng Set tránh đường dẫn trùng và gọi removeImage. ENOENT nghĩa là file đã không có, bỏ qua; lỗi khác ghi terminal.

Xóa trực tiếp trong Compass không chạy controller nên không dọn file ảnh. Để demo đủ chức năng, xóa qua web.

## 4. Danh mục sản phẩm

### Chọn, tạo và lọc

- Chọn sẵn: chọn trong dropdown Danh mục, để Danh mục mới trống.
- Tạo mới: nhập tên vào Danh mục mới rồi Lưu sản phẩm. Danh mục mới được tạo và gán vào sản phẩm.
- Tên mới đã có: dùng danh mục đó, không tạo trùng chỉ vì khác hoa/thường ở MongoDB.
- Lọc: bấm chip tên danh mục dưới thanh tìm; bấm Tất cả để bỏ lọc danh mục. Có thể tìm tên và lọc danh mục cùng lúc.
- Mặc định Khác; sản phẩm MongoDB cũ chưa có category được xếp vào Khác.

| File | Dòng | Vai trò |
|---|---|---|
| views/partials/fields.ejs | 6–19 | Dropdown và input tên mới |
| controllers/productController.js | 90–108 | readCategory: ưu tiên mới, kiểm tra/chọn tên |
| models/category.js | 3–8 | Schema Category và unique key |
| models/category.js | 10–16 | Danh sách tên, thêm Khác mặc định |
| models/category.js | 18–39 | Tìm hoặc tạo danh mục, xử lý trùng |
| models/product.js | 5 | Trường category của sản phẩm |
| controllers/productController.js | 110–123 | Nhận q/category, truy vấn và render danh sách |
| models/product.js | 26–48 | Lọc đồng thời tên và danh mục |
| views/index.ejs | 1–2 | Giá trị mặc định để view không thiếu category |
| views/index.ejs | 17 | Hidden giữ danh mục khi tìm |
| views/index.ejs | 29–34 | Hiển thị các chip lọc |

readCategory: 91–94 đọc chuỗi từ form; 96–100 có tên mới thì kiểm tra 80 ký tự và createOrFind; 103–107 không có mới thì kiểm tra dropdown thuộc danh sách.

Category.createOrFind: key là tên lowercase; findOne tìm trước; chưa có thì create. Nếu tạo đồng thời trùng unique key, bắt lỗi 11000 và đọc lại tên đã có. Tên lưu trong products.category; danh mục không liên kết bằng ObjectId trong bài này.

getAllProducts: lấy q và category từ req.query, kiểm tra danh mục hợp lệ, gọi Product.findAll(q, category), truyền đủ products/q/categories/category vào EJS. Điều này tránh lỗi category is not defined.

## 5. Hiển thị hai/ba ảnh và đổi ảnh

### Thao tác

Chọn cùng lúc hai/ba file trong form. Trước khi lưu, phải thấy Đã chọn 2 ảnh hoặc Đã chọn 3 ảnh. Sau khi lưu, card và popup có tương ứng hai/ba ảnh nhỏ. Bấm ảnh nhỏ để đổi ảnh chính. Chỉ một ảnh thì không có hàng ảnh nhỏ.

| Phần | File và dòng |
|---|---|
| Input cho chọn nhiều file | views/partials/fields.ejs 32–37, multiple tại 34 |
| Preview trước khi lưu | public/js/imagePreview.js 1–32 |
| Route nhận tối đa năm ảnh | routes/productRoutes.js 7 và 9 |
| Giới hạn 2 MB/file, năm file, năm trường chữ | middleware/upload.js 15 |
| Chuyển file thành đường dẫn | controllers/productController.js 138–139 |
| Schema giữ ảnh | models/product.js 13–14 |
| Card dùng gallery | views/index.ejs 44 |
| Ảnh chính và thumbnails | views/partials/gallery.ejs 1–15 |
| Click đổi ảnh | public/js/gallery.js 1–17 |
| Popup dùng cùng gallery | views/partials/productPopup.ejs 5–8 |
| Nạp JS phía trình duyệt | views/partials/footer.ejs 9–11 |

Ví dụ MongoDB lưu:

```javascript
image: "/uploads/a.jpg",
images: ["/uploads/a.jpg", "/uploads/b.jpg", "/uploads/c.jpg"]
```

image là ảnh đầu tiên để tương thích bản một ảnh. images là cả bộ đường dẫn, không phải bytes ảnh. File thật nằm trong public/uploads.

gallery.ejs: dòng 1 chọn images hoặc image cũ; dòng 4 hiện ảnh đầu; dòng 6 yêu cầu nhiều hơn một ảnh mới render thumbnails; dòng 8–12 lặp các ảnh nhỏ.

gallery.js: 1–3 tìm từng gallery và các phần tử bên trong; 4–12 showImage đổi src và trạng thái chọn; 14–16 gắn click cho từng ảnh nhỏ. Mỗi gallery độc lập nên đổi ảnh popup không đổi card.

imagePreview.js: 7–11 dọn URL tạm/preview cũ; 13–14 đếm ảnh; 16–20 kiểm tra số lượng/dung lượng; 22–30 tạo ảnh xem trước bằng URL.createObjectURL. Preview chưa lưu DB; nhấn Lưu mới upload.

## 6. Mua ngay mở popup

| File | Dòng | Vai trò |
|---|---|---|
| views/index.ejs | 50 | Nút mở dialog theo ID |
| views/index.ejs | 68–70 | Render popup cho từng sản phẩm |
| views/partials/productPopup.ejs | 1–16 | Khung dialog, ảnh và thông tin |
| public/js/productPopup.js | 1–7 | showModal và khóa cuộn nền |
| public/js/productPopup.js | 9–43 | Đóng bằng ×, nền hoặc Esc |

Nút Mua ngay là button, không phải thẻ a dẫn trang khác. Dữ liệu popup đã render sẵn cùng danh sách. Chức năng này chỉ xem chi tiết, chưa tạo đơn hàng/thanh toán. /products/:id vẫn là route chi tiết có thể mở trực tiếp.

## 7. Thay ảnh banner

Banner hiện dùng `product-mongodb/public/images/banner-sneakers-hd.png`. Bản MySQL có file tương ứng trong public/images của riêng nó.

### Cách A — Giữ nguyên tên file

1. Chuẩn bị ảnh PNG mới, nên đủ lớn cho màn hình máy tính.
2. Sao chép vào public/images và thay banner-sneakers-hd.png.
3. Nhấn Ctrl+F5 trên web để tải lại ảnh.

Không đổi đuôi PNG thành JPEG bằng cách rename; tên đuôi nên phù hợp loại ảnh thật.

### Cách B — Dùng tên file mới

1. Đặt ảnh `banner-moi.png` trong public/images.
2. Mở views/index.ejs, sửa dòng 7 thành:

```html
<img class="banner-image" src="/images/banner-moi.png" alt="Banner cửa hàng">
```

3. Lưu file, Ctrl+F5. Nếu muốn hai bản giống nhau, làm ở cả hai thư mục dự án.

| File | Dòng | Vai trò |
|---|---|---|
| views/index.ejs | 5–9 | Khối banner; ẩn khi có tìm kiếm hoặc danh mục |
| views/index.ejs | 7 | URL ảnh cần thay |
| app.js | 12 | Express phục vụ public, gồm ảnh banner |
| public/css/style.css | 709–726 | Quy tắc cuối cùng của banner: toàn bộ ảnh, chiều cao tự nhiên |

URL /images/banner-moi.png tương ứng file public/images/banner-moi.png. Không viết đường dẫn C:\\... hoặc /home/... vào src HTML. Banner không dùng Multer, không lưu trong DB và chưa có form upload banner trên web.

CSS có các quy tắc banner cũ ở phía trên, nhưng block 709–726 nằm sau nên quyết định cách hiển thị hiện tại. Muốn sửa kích thước/cách fit, sửa block cuối này. Khung banner dùng height: clamp(260px, 38vw, 560px); ảnh dùng width/height 100% và object-fit: contain để giữ đúng tỷ lệ, không cắt chữ. Nếu muốn banner luôn hiện cả khi lọc, sửa điều kiện dòng 5 thành khối không có if, đồng thời bỏ dòng đóng if 9.

## 8. Các phần hỗ trợ cần hiểu

| File | Dòng | Giải thích |
|---|---|---|
| controllers/productController.js | 6–10 | Tạo lỗi 400 để dùng chung |
| controllers/productController.js | 12–42 | Validation chữ/số |
| app.js | 8 | Tạo uploads nếu thiếu |
| app.js | 21–45 | Dọn ảnh mới khi lỗi và render thông báo |
| models/product.js | 2–18 | Schema sản phẩm MongoDB |
| views/partials/footer.ejs | 2–8 | Footer DND Store |

Sửa controller/model/app phải Ctrl+C và npm start lại vì Node.js giữ module trong bộ nhớ. Sửa EJS/CSS/ảnh thường chỉ cần lưu và tải lại; Ctrl+F5 bỏ cache trình duyệt. Nếu chỉ thay view mới mà server vẫn chạy controller cũ, có thể thiếu biến danh mục.

Cách trình bày MVC: Route nhận URL → Controller đọc/kiểm tra yêu cầu → Model truy vấn DB → Controller render View hoặc redirect. JavaScript trong public chạy ở trình duyệt để đổi ảnh/popup/preview, không trực tiếp truy vấn MongoDB.

## 9. Đối chiếu phần lưu DB của bản MySQL

Giao diện và cách thao tác giống MongoDB. Khác biệt chính là model/config và SQL.

| File MySQL | Dòng | Nội dung |
|---|---|---|
| models/product.js | 3–6 | JSON.parse images thành array |
| models/product.js | 8–30 | SELECT, lọc tên và category bằng AND |
| models/product.js | 32–37 | SELECT theo ID |
| models/product.js | 39–45 | INSERT; JSON.stringify bộ ảnh |
| models/product.js | 47–55 | UPDATE theo ID |
| models/product.js | 57–59 | DELETE theo ID |
| models/category.js | 3–11 | SELECT danh mục |
| models/category.js | 13–27 | Tạo hoặc dùng tên có sẵn |
| database.sql | 3–12 | Bảng products, category và images |
| database.sql | 14–17 | Bảng categories |
| migrations/002-product-categories.sql | 1–6 | Nâng cấp bảng cũ cho danh mục |

Dấu ? trong SQL là placeholder, giá trị gửi riêng qua params. MongoDB images là array; MySQL images là chuỗi JSON trong cột TEXT. Nếu MySQL đã có bảng cũ thì chạy migration phù hợp; cài mới chỉ import database.sql.

### Sửa banner bị vỡ

Ảnh gốc 270×148 không đủ độ phân giải cho banner desktop. Website hiện dùng public/images/banner-sneakers-hd.png, bản phục dựng bằng image_gen 1694×928. Giữ JPEG gốc trong thư mục để đối chiếu. Khung banner cao tối đa 560px; contain giữ toàn bộ bố cục và chữ, nền tối lấp phần dư hai bên. Đây là bản phục dựng bằng AI, không khôi phục chính xác mọi chi tiết từ ảnh nhỏ. Sau khi thay file, Ctrl+F5 để bỏ cache.
