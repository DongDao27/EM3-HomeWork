# DND Store — Giải thích bộ code hiện tại

Tài liệu này mô tả phiên bản hiện tại của hai dự án `product-mongodb` và `product-mysql`. Không cần đọc các hướng dẫn giao diện cũ. Cách cài đặt, cấu hình và thao tác trực tiếp database nằm trong [README](README.md).

## 1. Bài này làm gì và cần gì?

Ứng dụng quản lý sản phẩm có thêm, sửa, xóa, tìm theo tên, xem danh sách card và xem chi tiết. Người dùng chọn từ một đến năm ảnh từ máy, mỗi ảnh tối đa 2 MB. Dữ liệu lưu trong database; file ảnh lưu trong `public/uploads`.

Giao diện có header trắng DND Store, banner lớn và sản phẩm bên dưới. Tiêu đề, tìm kiếm và nút thêm đặt cạnh nhau khi đủ chiều rộng. Mỗi card có ảnh đầy đủ, ảnh nhỏ, tên, giá, số lượng, nút Mua ngay và hai icon sửa/xóa. Mua ngay mở popup chi tiết ngay trên danh sách, không đổi URL. Bấm ảnh nhỏ để đổi ảnh, không có mũi tên. Popup chưa đặt hàng hoặc thanh toán.

Chuẩn bị VS Code, Node.js/npm, trình duyệt và một trong hai môi trường database: MongoDB Server + Compass hoặc MySQL/MariaDB của XAMPP + phpMyAdmin. Compass là công cụ xem DB, không phải server. Apache của XAMPP phục vụ phpMyAdmin; Express phục vụ ứng dụng Node.js trên cổng riêng.

Kiến thức cần ôn: HTML form, Bootstrap grid/card, JavaScript biến/hàm/object/array/if, module CommonJS, async/await, GET/POST và CRUD. Không cần viết PHP cho bài này.

| Thư viện | Vai trò |
|---|---|
| express | Server HTTP, route, middleware |
| ejs | Tạo HTML từ dữ liệu |
| multer | Nhận và lưu các file ảnh |
| dotenv | Đọc .env vào process.env |
| bootstrap | CSS grid, form và button |
| mongoose | Schema và truy vấn MongoDB |
| mysql2 | Pool và truy vấn SQL cho MySQL |

`fs`, `path`, `crypto` là module có sẵn của Node.js. Express có `express.urlencoded` nên không cần body-parser. Form sửa/xóa dùng POST nên không cần method-override.

## 2. Cấu trúc MVC và thứ tự tạo file

Model làm việc với database, View hiển thị HTML, Controller kiểm tra đầu vào và điều phối. Route nối URL với controller; middleware upload nhận ảnh trước controller. JavaScript trong public chạy trên trình duyệt, khác với controller chạy ở server.

| Thứ tự | File/phần tạo | Mục đích |
|---|---|---|
| 1 | package.json | Khai báo thư viện và lệnh start |
| 2 | .env.example, .env, .gitignore | Cấu hình DB/cổng và loại file riêng khỏi Git |
| 3 | database.sql ở bản MySQL | Tạo database và bảng trước khi chạy |
| 4 | config/database.js | Kết nối DB |
| 5 | models/product.js, models/category.js | Schema/truy vấn sản phẩm và danh mục |
| 6 | middleware/upload.js | Cấu hình nhận nhiều ảnh |
| 7 | controllers/productController.js | Kiểm tra dữ liệu và các chức năng |
| 8 | routes/productRoutes.js | Ánh xạ URL |
| 9 | views/partials/header.ejs, footer.ejs | Khung HTML chung |
| 10 | views/partials/fields.ejs, gallery.ejs | Input chung và bộ ảnh chung |
| 11 | views/partials/productPopup.ejs | Popup chi tiết |
| 12 | views/index.ejs, add.ejs, edit.ejs, show.ejs, error.ejs | Các màn hình |
| 13 | public/css/style.css, public/fonts | Giao diện và font local |
| 14 | public/js/gallery.js, productPopup.js, imagePreview.js | Đổi ảnh, popup, xem trước ảnh |
| 15 | app.js | Ghép các phần, kết nối DB và chạy server |

Đây là thứ tự viết để dễ học. Khi chạy, Node.js bắt đầu ở app.js. Thư mục `public/uploads` chứa ảnh; app tự tạo nếu chưa có. `.gitkeep` giữ thư mục khi chưa có file. `package-lock.json` ghi phiên bản thư viện đã cài, không sửa thủ công. Không cần tạo node_modules thủ công.

Nếu tự xây dựng từ đầu: tạo thư mục → `npm init -y` → cài thư viện → tạo file theo bảng. Nếu dùng bộ code sẵn: sao chép .env.example thành .env, chuẩn bị DB, chạy `npm install` rồi `npm start`. Không chạy khi các file import chưa được tạo đủ.

Nên học một bản trước: danh sách/thêm → sửa/xóa → tìm/chi tiết → nhiều ảnh/popup. Sau đó đối chiếu model/config của bản còn lại.

## 3. Thiết kế dữ liệu

| Trường | MongoDB | MySQL | Ý nghĩa |
|---|---|---|---|
| ID | _id: ObjectId | id: INT AUTO_INCREMENT | Khóa chính |
| name | String | VARCHAR(100) | Tên sản phẩm |
| category | String | VARCHAR(80) | Tên danh mục, mặc định Khác |
| price | Number | DECIMAL(12,2) | Giá |
| quantity | Number nguyên | INT | Số lượng |
| image | String | VARCHAR(255) | Đường dẫn ảnh đầu tiên |
| images | Array String | TEXT chứa JSON array | Các đường dẫn của bộ ảnh |
| Thời gian | createdAt, updatedAt | created_at | Thời gian tạo/cập nhật theo từng bản |

Ví dụ images trong MongoDB:

```javascript
images: ["/uploads/a.png", "/uploads/b.png", "/uploads/c.png"]
```

MySQL lưu chuỗi JSON tương ứng; model đổi lại thành array trước khi đưa cho view. Giữ `image` để sản phẩm cũ có một ảnh vẫn hoạt động. Không lưu bytes của ảnh trong database.

Tên dài tối đa 100 ký tự; danh mục tối đa 80 ký tự. Giá từ 0 đến 9.999.999.999,99; số lượng là số nguyên từ 0 đến 2.147.483.647. Quy tắc tại controller áp dụng cho cả hai bản.

## 4. app.js — Khởi động và middleware

| Thành phần | Giải thích |
|---|---|
| require('dotenv').config() | Nạp cấu hình trước khi import module DB |
| express() | Tạo app |
| fs.mkdirSync(..., { recursive: true }) | Đảm bảo uploads tồn tại |
| app.set('view engine', 'ejs') | Chọn EJS để tạo trang |
| app.set('views', ...) | Chỉ vị trí thư mục view |
| express.urlencoded({ extended: false }) | Đọc trường của form thông thường |
| express.static(public) | Phục vụ CSS, JS, font và ảnh |
| app.use('/bootstrap', express.static(...)) | Phục vụ Bootstrap từ node_modules, không cần CDN |
| app.use('/', productRoutes) | Gắn route sản phẩm |
| Middleware 404 | URL không khớp route thì báo không tìm thấy |
| Middleware (err, req, res, next) | Nhận lỗi từ các bước xử lý trước |
| start() | Chờ DB kết nối rồi mở HTTP server |
| app.listen(port, callback) | Lắng nghe request và báo địa chỉ |
| require.main === module | Chỉ tự start khi chạy app.js trực tiếp |
| module.exports = app | Cho phép nhập app để kiểm tra mà không tự start |

Middleware lỗi lặp req.files để dọn các ảnh mới nếu nhập liệu/ghi DB thất bại. Lỗi có err.status dùng mã đó; Multer mặc định 400; lỗi khác 500. LIMIT_FILE_COUNT/LIMIT_UNEXPECTED_FILE được đổi thành thông báo giới hạn năm ảnh; LIMIT_FILE_SIZE thành thông báo 2 MB. Lỗi hệ thống chi tiết được ghi ở terminal.

404 và middleware lỗi đứng sau route. Trong Express 5, lỗi từ controller async được chuyển tới middleware lỗi. start().catch ghi lỗi rồi process.exit(1) nếu không kết nối DB lúc khởi động. Không mở web trước khi DB kết nối thành công.

## 5. config/database.js và database.sql

### MongoDB

connectDB() gọi await mongoose.connect với MONGO_URI hoặc URI mặc định local. serverSelectionTimeoutMS: 5000 đặt khoảng thời gian chọn DB server. Thành công ghi thông báo, thất bại truyền lỗi về start(). Mongoose tự quản lý kết nối cho các model.

### MySQL

mysql2/promise cho phép await các truy vấn. mysql.createPool tạo nhóm kết nối dùng lại, tối đa năm kết nối. Host, port, user, password, database lấy từ .env; charset utf8mb4 hỗ trợ Unicode.

connectDB() chạy SELECT 1 để xác nhận có thể kết nối và thực thi SQL. Nó chưa kiểm tra bảng products nên vẫn phải import database.sql. Module xuất connectDB và gắn thêm thuộc tính pool để model lấy ra bằng destructuring.

### SQL tạo bảng

CREATE DATABASE IF NOT EXISTS tạo DB nếu chưa có; USE chọn DB; CREATE TABLE IF NOT EXISTS tạo bảng nếu chưa tồn tại. Câu lệnh này không tự bổ sung cột cho bảng cũ.

AUTO_INCREMENT tự cấp ID; PRIMARY KEY đảm bảo khóa chính; NOT NULL không cho NULL; DECIMAL(12,2) có 12 chữ số, trong đó hai chữ số thập phân; CHECK kiểm tra giá/số lượng không âm; DEFAULT CURRENT_TIMESTAMP ghi thời điểm tạo. utf8mb4_unicode_ci lưu tiếng Việt và so sánh không phân biệt hoa/thường; cách so dấu phụ thuộc collation.

MySQL nâng cấp từ bản một ảnh: chạy migrations/001-product-images.sql một lần để thêm cột images. Cài mới chỉ import database.sql. MongoDB không cần migration cho bài này.

## 6. models/product.js — MongoDB

Schema đặt name required/trim/maxlength; price required/min; quantity required/min/validate Number.isInteger; image required; images là array chuỗi mặc định rỗng. timestamps thêm createdAt/updatedAt. mongoose.model('Product', schema) dùng collection products theo quy ước mặc định.

| Hàm | Đầu vào và các bước | Kết quả |
|---|---|---|
| toProduct(doc) | Thêm id = String(doc._id) vào object | Object có id thống nhất với MySQL, không đổi ID trong DB |
| findAll(q) | Escape regex; filter rỗng nếu không có q; nếu có q dùng name $regex với i; find → sort → lean → map | Array sản phẩm |
| findById(id) | findById(id).lean(); không có trả null, có thì toProduct | Một sản phẩm hoặc null |
| create(data) | Product.create(data) | Promise ghi document mới |
| update(id, data) | findByIdAndUpdate với runValidators: true | Promise cập nhật |
| remove(id) | findByIdAndDelete | Promise xóa document |

Escape regex biến `[`, `*`, `.`, ... trong từ khóa thành ký tự thường; tìm `[USB]` sẽ tìm tên chứa đúng chuỗi đó. `i` không phân biệt hoa/thường. sort createdAt và _id giảm dần để sản phẩm mới đứng trước. lean trả object thường phù hợp render, không cần phương thức Mongoose document. map thêm id cho từng kết quả.

Các wrapper create/update/remove trả Promise nên controller vẫn await được dù wrapper không khai báo async. runValidators cần khi cập nhật để chạy kiểm tra schema. Model không tự xóa file ảnh.

## 7. models/product.js — MySQL

Model lấy pool từ config. Mọi giá trị do người dùng cung cấp được truyền qua params, không nối trực tiếp vào SQL.

| Hàm | Các bước | Kết quả |
|---|---|---|
| toProduct(row) | JSON.parse(row.images), hoặc dùng [row.image] nếu chưa có bộ ảnh | Object có images array |
| findAll(q) | Escape !/%/_; SELECT mặc định hoặc LIKE ? ESCAPE '!'; pool.execute; map(toProduct) | Array sản phẩm |
| findById(id) | SELECT WHERE id = ?; lấy rows[0] rồi toProduct | Sản phẩm hoặc null |
| create(data) | INSERT năm trường; JSON.stringify(images) | result.insertId |
| update(id, data) | UPDATE năm trường WHERE id = ?; stringify images | Promise cập nhật |
| remove(id) | DELETE WHERE id = ? | Promise xóa |

`const [rows]` lấy array hàng từ kết quả driver, bỏ metadata. Tham số INSERT theo thứ tự name, price, quantity, image, JSON images. UPDATE thêm ID ở cuối. WHERE ID tránh sửa/xóa toàn bộ bảng.

Trong LIKE, % đại diện chuỗi bất kỳ, _ đại diện một ký tự. Escape từ khóa giúp dấu % hoặc _ người dùng nhập được tìm như ký tự thường. Hai dấu % ứng dụng thêm ở ngoài giúp tìm tên chứa từ khóa. Dấu ? truyền giá trị tách khỏi SQL, khác với việc escape wildcard.

images ở DB phải là JSON hợp lệ nếu sửa bằng tay; JSON.parse sẽ báo lỗi khi chuỗi không hợp lệ. Nên thêm/sửa ảnh qua web.

## 8. middleware/upload.js và routes/productRoutes.js

multer.diskStorage nhận destination và filename. destination dùng path.join với __dirname để lưu vào public/uploads. filename dùng randomUUID() và phần mở rộng theo MIME cho phép, giảm trùng tên. cb(null, filename) báo tên file; cb(null, true) chấp nhận; cb(error) báo lỗi.

types cho image/jpeg, image/png, image/webp. limits đặt 2 MB mỗi file, tối đa năm file và năm trường chữ: name, price, quantity, category và newCategory. fileFilter kiểm tra MIME và từ chối loại khác. MIME là thông tin client gửi, chưa xác minh nội dung ảnh bằng giải mã.

| Method | URL | Hàm |
|---|---|---|
| GET | / | getAllProducts |
| GET | /search | getAllProducts |
| GET | /add | showAddProductForm |
| POST | /add | upload.array('image', 5) → addProduct |
| GET | /edit/:id | showEditProductForm |
| POST | /edit/:id | upload.array('image', 5) → updateProduct |
| POST | /delete/:id | deleteProduct |
| GET | /products/:id | showProductDetail |

express.Router tạo bộ route, cuối file xuất router. Route thêm/sửa nhận ảnh trước controller. HTML file input phải có name="image", multiple; form có enctype="multipart/form-data". req.files là array; req.body chứa name/price/quantity. Khi không chọn file, req.files thường là array rỗng.

req.params.id lấy phần động của đường dẫn; req.query.q lấy từ khóa sau dấu ?; req.body lấy trường form; req.files lấy thông tin upload. GET đọc, POST ghi; POST không tự thay thế phân quyền hoặc CSRF.

## 9. controllers/productController.js — Từng hàm

### badRequest(message)

Tạo Error, gán status 400 và throw. Throw dừng xử lý bình thường; middleware lỗi trả thông báo và dọn ảnh mới. Đây là hàm dùng chung cho lỗi đầu vào.

### readForm(body)

Tên phải là chuỗi, trim bỏ khoảng trắng hai đầu. Number chuyển chuỗi giá/số lượng thành số. Kiểm tra tên không rỗng, không quá 100; giá có nhập, hữu hạn và trong phạm vi; số lượng có nhập, nguyên và trong phạm vi. Number('') bằng 0 nên cần kiểm tra chuỗi rỗng trước khi chấp nhận.

Number.isFinite loại NaN/Infinity; Number.isInteger loại số lượng lẻ. Math.round(price * 100) / 100 làm tròn giá hai chữ số. Trả object name/price/quantity; ảnh được thêm riêng từ req.files.

### findProduct(id)

MongoDB kiểm tra ID có 24 ký tự hexadecimal. MySQL kiểm tra chuỗi số nguyên dương và Number.isSafeInteger. ID sai định dạng trả 400. ID hợp lệ được truy vấn; không có sản phẩm trả 404; có thì trả product. Các chức năng sửa/xóa/chi tiết dùng lại.

### removeImage(image)

Chỉ xử lý đường dẫn bắt đầu /uploads/. path.basename lấy tên, path.join ghép với uploads, fs.unlink xóa file. try/catch bỏ qua ENOENT vì file đã không tồn tại, lỗi khác ghi terminal. Không làm thao tác DB thất bại chỉ vì ảnh không dọn được.

### removeProductImages(product)

Lấy images nếu có phần tử, nếu không dùng [image] của dữ liệu cũ. new Set loại đường dẫn trùng. Lặp từng đường dẫn và await removeImage.

### getAllProducts(req, res)

Khởi tạo q rỗng; nếu req.query.q là chuỗi thì trim và slice tối đa 100 ký tự. await Product.findAll(q), render index với products và q. Dùng chung danh sách và tìm kiếm. View giữ q trong input.

### showAddProductForm(req, res)

Lấy danh mục qua Category.findAll rồi render add. Form dùng product null để các input trống và ảnh bắt buộc.

### addProduct(req, res)

readForm kiểm tra chữ/số; yêu cầu req.files có ít nhất một phần tử; map mỗi filename thành /uploads/filename; gán data.images và data.image = images[0]. await Product.create rồi redirect('/'). Chỉ chuyển trang sau khi ghi thành công. Nếu thất bại, middleware lỗi dọn các file mới.

### showEditProductForm(req, res)

findProduct(req.params.id), render edit với product. Form nhận cả categories, có dữ liệu và ảnh hiện tại.

### updateProduct(req, res)

Tìm sản phẩm hiện tại; readForm dữ liệu mới; mặc định giữ image/images cũ. Có file mới thì thay bằng bộ mới và lấy ảnh đầu tiên làm image. await Product.update; thành công mới removeProductImages của bộ cũ; redirect danh sách.

Không chọn ảnh giữ bộ cũ. Chọn ảnh mới thay toàn bộ bộ cũ, không cộng dồn. Chưa có xóa riêng từng ảnh hoặc đổi ảnh bìa. Không xóa ảnh cũ trước khi DB ghi, để lỗi ghi không làm mất ảnh đang dùng.

### deleteProduct(req, res)

Tìm sản phẩm, await Product.remove, dọn tất cả ảnh rồi redirect. Icon xóa gửi POST sau confirm của trình duyệt. Nếu xóa DB báo lỗi thì không dọn ảnh.

### showProductDetail(req, res)

Tìm theo ID rồi render show. Route chi tiết vẫn dùng được qua URL trực tiếp. Mua ngay không gọi route này: nó mở dialog đã render sẵn trong index.

## 10. View — Vì sao tách nhiều file?

MVC không yêu cầu View chỉ có một file. Tách theo màn hình và phần dùng chung giúp giảm lặp code. Một lần render ghép các partial thành một tài liệu HTML trả cho trình duyệt, không phải nhiều trang đồng thời.

| File | Vai trò |
|---|---|
| index.ejs | Tiêu đề, tìm kiếm, nút thêm, card; render một popup cho mỗi sản phẩm |
| add.ejs | Form thêm, fields nhận product null |
| edit.ejs | Form sửa, fields nhận product hiện tại |
| show.ejs | Chi tiết qua URL trực tiếp |
| error.ejs | Thông báo và liên kết danh sách |
| partials/header.ejs | UTF-8, viewport, title, CSS, header DND Store, mở main |
| partials/footer.ejs | Đóng main, nạp ba file JS với defer, đóng body/html |
| partials/fields.ejs | Input name/price/quantity/file, số ảnh chọn, preview, ảnh hiện tại |
| partials/gallery.ejs | Ảnh chính và các nút ảnh nhỏ khi có nhiều ảnh |
| partials/productPopup.ejs | dialog, nút đóng, gallery và thông tin sản phẩm |

`<% ... %>` chạy JS; `<%= ... %>` in giá trị đã escape HTML; `<%- ... %>` in HTML nguyên, dùng cho include. Tên người dùng nhập luôn dùng <%= để không trở thành mã HTML. include ghép partial; forEach tạo card/thumbnail cho từng phần tử.

Gallery ưu tiên product.images có phần tử; nếu không dùng product.image. Thumbnail có aria-pressed và is-selected để báo ảnh đang chọn. Một ảnh thì không render hàng thumbnail. Icon dùng SVG nội tuyến, không cần CDN; aria-label và title mô tả thao tác.

Form tìm GET làm từ khóa xuất hiện trên URL. Bỏ lọc chỉ hiện khi q có giá trị. Giá dùng Number(...).toLocaleString('vi-VN') để đọc dễ và xử lý DECIMAL MySQL có thể trả dưới dạng chuỗi. Confirm trả true gửi form xóa, false hủy.

## 11. JavaScript phía trình duyệt

### gallery.js

querySelectorAll('[data-gallery]') tìm từng bộ ảnh. Mỗi gallery giữ mainImage và array thumbnails riêng. showImage(index) lấy src của thumbnail tương ứng, đổi src ảnh chính; lặp các nút để cập nhật is-selected và aria-pressed. Mỗi thumbnail có listener click gọi showImage(index). Không có mũi tên hoặc tự chạy slideshow. Gallery popup và card hoạt động độc lập.

### productPopup.js

Nút data-open-product chỉ tới id dialog của cùng sản phẩm. Click lấy dialog rồi showModal(), thêm popup-open để khóa cuộn nền. Dialog có aria-labelledby trỏ tới tên sản phẩm và nút đóng autofocus.

closePopup gọi close() và bỏ khóa cuộn. Nút × gọi hàm này. Click trên dialog kiểm tra tọa độ so với getBoundingClientRect; chỉ đóng khi target là dialog và bấm ngoài khung. cancel mở khóa khi nhấn Esc. close mở khóa nếu dialog không còn open để không làm ảnh hưởng lần mở mới.

Dialog native giữ focus trong popup và trả focus về nút mở khi đóng. Không gửi request hoặc đổi URL lúc mở. Dữ liệu chi tiết đã được EJS render cùng danh sách.

### imagePreview.js

Tìm data-image-picker; lấy input, vùng đếm và vùng preview. Listener change giải phóng các object URL cũ bằng URL.revokeObjectURL, xóa preview cũ, reset setCustomValidity.

Array.from(input.files) lấy file đang chọn; textContent hiển thị số lượng. Trên năm file hoặc file lớn hơn 2 MB thì setCustomValidity để trình duyệt chặn gửi. slice(0, 5) giới hạn số preview. createObjectURL tạo URL tạm, createElement('img') tạo ảnh, append đưa vào form. File chỉ được upload khi nhấn Lưu, preview không ghi DB.

Chọn lại file thay lựa chọn cũ. Muốn ba ảnh: giữ Ctrl/Command, chọn cùng lúc rồi Open; phải thấy “Đã chọn 3 ảnh”. Server vẫn kiểm tra bằng Multer dù JS có validation.

## 12. CSS, font và hiển thị ảnh

style.css hiện chỉ có các quy tắc cần dùng, không chồng nhiều bản CSS cũ. Font Noto Sans được đóng gói trong public/fonts, gồm Regular 400 và Bold 700 cùng giấy phép. @font-face tải font local; không cần Internet. Body dùng DND Sans; input/button kế thừa cùng font. Header HTML dùng UTF-8 cho tiếng Việt. Nếu còn thấy kiểu cũ, tải lại Ctrl+F5 để tránh cache CSS/font.

Card dùng border: 1px solid và bo góc 4px, không có bóng. Ảnh chính dùng width 100%, height auto và padding 0 để giữ tỷ lệ tự nhiên. Ảnh hiển thị đầy đủ, không cắt mất chữ hoặc sản phẩm. Không đặt chiều cao cố định nên không tạo thêm khoảng trống trên/dưới do tỷ lệ khung. Khoảng trắng có sẵn trong file ảnh vẫn giữ nguyên. Không thể đồng thời phủ kín mọi tỷ lệ khung và giữ toàn bộ ảnh nếu không có khoảng trống hoặc biến dạng.

Gallery chừa đều 8px quanh ảnh. Ảnh ở card, popup và chi tiết đều dùng chiều cao tự nhiên theo chiều rộng. Thumbnail giữ tỷ lệ bằng contain, ảnh chọn có viền đen.

Container căn giữa, tối đa 1440px, chừa lề hai bên. Header cao 92px. Flex đặt tiêu đề và nhóm tìm/thêm cùng hàng khi đủ chỗ; dưới 1200px nhóm công cụ xuống hàng để không tràn. Bootstrap col-12/col-sm-6/col-lg-4/col-xl-3 cho một/hai/ba/bốn card tùy màn hình. Grid chia popup/chi tiết hai cột, đổi thành một cột dưới 768px.

focus-visible, label, alt, aria-label và skip-link hỗ trợ bàn phím. Skip-link chỉ hiện khi focus. SVG dùng currentColor để màu icon đi cùng màu nút.

## 13. Luồng thao tác để trình bày

**Thêm:** add.ejs → POST /add → Multer → req.body/req.files → addProduct → readForm → model.create → DB → redirect / → findAll → index.ejs. Preview chạy trước upload, không thay model.

**Sửa:** GET /edit/:id → findProduct → edit.ejs → POST → readForm → giữ/thay bộ ảnh → model.update → dọn ảnh cũ nếu thay → redirect.

**Xóa:** confirm → POST /delete/:id → findProduct → model.remove → dọn bộ ảnh → redirect.

**Tìm:** GET /search?q=... → getAllProducts → findAll(q) → index với kết quả. MongoDB regex escape/i; MySQL LIKE escape/collation.

**Mua ngay:** listener trong productPopup.js → showModal trên dialog sẵn có → bấm thumbnail gọi gallery.js → đóng → quay focus về nút. Không thay dữ liệu, không điều hướng và không thanh toán.

## 14. Cú pháp thường được hỏi

| Cú pháp | Ý nghĩa |
|---|---|
| const / let | const không gán lại biến; let dùng khi cần gán lại |
| require / module.exports / exports.fn | Nhập/xuất module CommonJS |
| async / await | Hàm Promise và chờ IO trong hàm; không chặn toàn bộ server |
| return / throw | Trả kết quả / báo lỗi và dừng luồng thường |
| try/catch, .catch | Bắt lỗi đồng bộ/bất đồng bộ tương ứng |
| typeof, trim, slice | Kiểm tra kiểu, bỏ khoảng trắng, giới hạn chuỗi |
| Number.isFinite / Number.isInteger | Kiểm tra số hữu hạn / số nguyên |
| { products, q } | Object viết tắt tên thuộc tính bằng tên biến |
| { pool } = ... / [rows] = ... | Destructuring object / array |
| map / forEach / Set | Chuyển array / lặp / loại giá trị trùng |
| `${...}` | Ghép biến vào template string |
| || / && / ! | Giá trị dự phòng / điều kiện đồng thời / phủ định |
| condition ? a : b | Chọn a hoặc b theo điều kiện |
| __dirname, path.join, path.basename | Thư mục JS, ghép đường dẫn, lấy tên file |
| res.render / res.redirect | Trả HTML / yêu cầu trình duyệt tới URL khác |
| HTTP 200/302/400/404/500 | Thành công/chuyển trang/sai đầu vào/không thấy/lỗi server |

## 15. Kiểm thử và demo để nộp bài

| Thao tác | Kết quả cần chứng minh |
|---|---|
| Thêm một ảnh | Card có ảnh, không có thumbnail |
| Thêm ba ảnh | Form preview ba ảnh; DB images có ba đường dẫn; card/popup có ba thumbnail |
| Thêm sáu ảnh hoặc ảnh > 2 MB | Bị từ chối, không để file upload thừa |
| Tìm khác hoa/thường | Có kết quả đúng |
| Tìm không tồn tại | Thông báo rỗng |
| Sửa không chọn ảnh | Giữ bộ cũ |
| Sửa chọn bộ mới | DB có bộ mới, file cũ được dọn |
| Xóa Cancel/OK | Hủy giữ sản phẩm; OK xóa DB và file |
| Mua ngay | Popup đúng sản phẩm, URL giữ nguyên |
| Bấm ảnh nhỏ trong popup | Đổi ảnh popup, không đổi ảnh card |
| Đóng bằng ×/Esc/nền | Popup đóng, cuộn và focus được khôi phục |
| ID sai/không tồn tại | 400/404 |
| Tắt và chạy lại | Dữ liệu vẫn còn |
| Ảnh dọc/ngang có chữ ở viền | Không bị cắt trên card/popup |

Demo 7–10 phút: giới thiệu MVC (1 phút), thêm ba ảnh (2 phút), tìm/sửa/xóa (2 phút), popup (1 phút), mở Compass/phpMyAdmin đối chiếu dữ liệu (1 phút), giải thích route–controller–model–view và so sánh hai DB (1–3 phút).

Báo cáo gồm mục tiêu, công nghệ, cấu trúc MVC, thiết kế dữ liệu, route/luồng, ảnh giao diện, kết quả kiểm thử thực tế và hạn chế. Chỉ ghi kết quả đã tự chạy trên máy; điểm còn phụ thuộc tiêu chí giảng viên.

## 16. Câu hỏi vấn đáp và giới hạn

**Vì sao tách view?** Tách theo màn hình, dùng partial cho phần lặp. EJS ghép thành HTML hoàn chỉnh, dễ sửa hơn một file có nhiều điều kiện.

**Tại sao ảnh chỉ lưu đường dẫn?** File do Express.static phục vụ; DB lưu thông tin để truy xuất. Sao lưu DB cần sao lưu thêm uploads.

**Vì sao kiểm tra server khi HTML có required/min?** HTML/JS có thể bị bỏ qua, server quyết định nhận dữ liệu.

**Vì sao update rồi mới xóa ảnh cũ?** Nếu DB thất bại thì ảnh cũ vẫn còn dùng. Ảnh mới lỗi được middleware dọn.

**Dấu ? trong SQL và escape LIKE khác gì?** ? giữ giá trị tách khỏi cú pháp SQL; escape LIKE giúp ký tự wildcard người dùng nhập được coi là chữ thường.

**Font mới có cần mạng không?** Không, font được đóng gói local và phục vụ qua express.static.

**Vì sao ảnh không phủ kín mọi khung?** contain giữ toàn bộ ảnh và tỷ lệ; cover có thể cắt ảnh, nên bản hiện tại dùng contain.

**Bài đã là website bán hàng hoàn chỉnh chưa?** Chưa. Mua ngay mở chi tiết; chưa có giỏ hàng, đơn hàng hay thanh toán. Cũng chưa có đăng nhập, phân quyền, CSRF hoặc phân trang.

**Upload đã xác minh ảnh thật chưa?** Chưa; giới hạn MIME/dung lượng, không giải mã nội dung ảnh. Phù hợp bài local, cần bổ sung trước khi triển khai công khai.

**DB và file có cùng giao dịch không?** Không. Nếu dọn file lỗi có thể còn file thừa. Chưa xử lý đồng thời nhiều người sửa cùng sản phẩm.

**Giá MongoDB chính xác kế toán không?** Number và làm tròn hai chữ số phù hợp minh họa, chưa phải biểu diễn tiền cho nghiệp vụ kế toán.

## 17. Banner và bố cục trang chủ hiện tại

index.ejs render store-banner khi q rỗng. Ảnh banner là public/images/banner-headphones.png, chữ là h1 và nút là liên kết #products. Khi q có nội dung, banner ẩn để xem kết quả tìm nhanh hơn.

header.ejs thêm class storefront vào main chỉ khi title là Danh sách sản phẩm. CSS storefront bỏ giới hạn chiều rộng của main để banner phủ ngang. products-section căn giữa và chừa lề cho danh sách; các trang thêm/sửa vẫn dùng container giới hạn như trước.

store-banner dùng position relative; banner-image dùng absolute phủ vùng banner. object-fit cover dùng riêng cho banner quảng cáo. Pseudo-element ::after tạo lớp tối để chữ trắng dễ đọc. banner-content có z-index để chữ/nút nằm trên ảnh. Nội dung text là HTML nên có thể sửa trong index.ejs mà không tạo lại ảnh.

Bên dưới là section id products, tiêu đề h2, form tìm, nút thêm và grid card. Nút trên banner là liên kết tới mục sản phẩm, không trùng chức năng Mua ngay hay Thêm. Header chỉ có DND Store và liên kết Sản phẩm. Màu nút/viền chọn chuyển sang đen, không thay luồng CRUD/popup.

Không thêm các menu Nam/Nữ/Trẻ em hoặc biểu tượng giỏ hàng vì model hiện không có phân loại hay đặt hàng. Đây là bố cục tham khảo với nội dung DND Store, không sao chép chức năng chưa triển khai.

Ảnh banner được tạo bằng built-in image_gen. Prompt: “Cinematic ultrawide technology ecommerce hero; unbranded matte black over-ear headphones on dark stone on the right; warm sunset lighting; dark negative space on the left for white HTML headline; premium photography; no text, logos or watermark.” File được đóng gói local ở public/images/banner-headphones.png trong hai bản, không phụ thuộc link bên ngoài.

## 18. Danh mục sản phẩm và footer hiện tại

### Dữ liệu và file mới

models/category.js quản lý danh mục. MongoDB có schema name (tối đa 80), key là tên chuyển chữ thường có unique index để tránh tên chỉ khác hoa/thường. MySQL có bảng categories với id tự tăng, name VARCHAR(80) UNIQUE. Products có category là tên danh mục, mặc định Khác. Dùng chuỗi tên để code dễ theo dõi; phiên bản này chưa có đổi tên/xóa danh mục hay khóa ngoại liên kết ID.

Khác là danh mục mặc định do findAll cung cấp, không bắt buộc có bản ghi categories. Danh mục tồn tại độc lập với sản phẩm nên không mất khi xóa sản phẩm cuối cùng. MongoDB sản phẩm cũ thiếu category được toProduct đổi thành Khác; bộ lọc Khác bao gồm category null/thiếu/rỗng. MySQL migration đặt mặc định Khác cho dữ liệu cũ.

### Các hàm models/category.js

findAll(): MongoDB đọc danh mục sort name, MySQL SELECT name ORDER BY name; cả hai trả array tên có Khác ở đầu.

createOrFind(name): trả tên chuẩn đã có hoặc tạo tên mới. MongoDB dùng key lower-case tìm bản ghi, create khi chưa có; nếu lỗi duplicate key 11000 vì tạo đồng thời thì đọc lại tên đã có. MySQL INSERT ... ON DUPLICATE KEY UPDATE name = name rồi SELECT name theo tên nhập. MySQL sử dụng collation của DB khi xác định trùng; MongoDB key chỉ chuẩn hóa hoa/thường. Hai DB có thể khác cách coi tên có dấu là tương đương.

### Hàm readCategory(body) trong controller

Đọc newCategory và category dạng chuỗi đã trim. Nếu newCategory có nội dung: kiểm tra 80 ký tự, gọi Category.createOrFind và trả tên. Nếu không nhập mới: lấy Category.findAll, kiểm tra lựa chọn có trong danh sách rồi trả tên; sai báo 400. Mặc định Khác khi request không gửi trường category.

addProduct gọi readCategory sau khi kiểm tra dữ liệu và ít nhất một ảnh. updateProduct gọi sau readForm. Tên category được đưa cùng data vào Product.create/update. Tạo danh mục và lưu sản phẩm không phải một transaction chung: nếu ghi sản phẩm thất bại, danh mục vừa tạo có thể vẫn còn để dùng lại.

showAddProductForm giờ là async: lấy danh mục và render add với categories. showEditProductForm lấy sản phẩm, lấy danh mục rồi render edit với cả hai. fields.ejs nhận categories và product, lặp option cho select; chọn sẵn product.category khi sửa. Input newCategory để tạo mới; cả hai trường được gửi trong multipart nên Multer fields tăng từ ba lên năm.

### Lọc và các thay đổi model sản phẩm

getAllProducts đọc q và req.query.category; lấy categories, kiểm tra danh mục lọc hợp lệ, gọi Product.findAll(q, category) rồi render index với products/q/categories/category.

MongoDB findAll bổ sung filter.category; riêng Khác dùng $or cho tên Khác, null/thiếu hoặc rỗng. Bộ lọc tên và danh mục áp dụng đồng thời. MySQL findAll gom điều kiện name LIKE và category = ? vào array conditions, nối bằng AND; params theo đúng thứ tự điều kiện. INSERT/UPDATE thêm category cùng tham số.

index.ejs có category-list gồm Tất cả và từng tên. Liên kết dùng encodeURIComponent để tên tiếng Việt hoặc ký tự & không làm hỏng URL. Nhấn danh mục giữ q; form tìm có hidden category nên tìm giữ bộ lọc. Bỏ lọc từ khóa giữ danh mục, Tất cả bỏ danh mục và giữ từ khóa. Banner chỉ hiện khi không có cả q lẫn category.

Popup và trang chi tiết hiển thị tên danh mục. Các chức năng ảnh, icon, popup và CRUD vẫn như các mục trước.

### Footer và tên cửa hàng

header.ejs hiển thị DND Store; title cũng đổi tên. footer.ejs đóng main rồi render footer với tên, liên kết danh sách và năm từ new Date().getFullYear(). CSS dùng body flex theo cột, main flex: 1 để footer ở dưới khi nội dung ít. Mobile footer tự xuống hàng. Font kỹ thuật trong CSS tên DND Sans, dùng cùng file Noto Sans local.

### Nâng cấp và kiểm thử danh mục

MySQL cài mới: database.sql có category và bảng categories. Nâng cấp: chạy migrations/002-product-categories.sql một lần; nếu thiếu images chạy 001 trước. MongoDB không cần migration.

Thử tạo danh mục Tai nghe khi thêm sản phẩm ba ảnh; lọc Tai nghe; mở popup kiểm tra tên danh mục; sửa chọn danh mục sẵn hoặc tạo mới; tìm tên cùng danh mục; nhập tên danh mục lặp khác hoa/thường; nhập danh mục không có bằng request trực tiếp phải 400; dữ liệu cũ vào Khác; xóa sản phẩm vẫn giữ danh mục. Footer và header phải cùng tên DND Store.

### Giá trị mặc định cho view danh sách

index.ejs đọc locals.category vào selectedCategory, mặc định chuỗi rỗng; đọc locals.categories vào categoryList, mặc định ['Khác']. View dùng hai biến đó để không báo ReferenceError nếu nơi render thiếu dữ liệu. Controller hiện tại vẫn phải truyền đầy đủ products, q, categories, category để lọc đúng.

Khi cập nhật file controller/model/app, dừng server cũ rồi npm start lại. EJS có thể đọc view mới trong khi Node.js vẫn giữ module controller cũ trong bộ nhớ, dẫn đến view mới nhận thiếu biến.

### Banner hiện tại do người dùng cung cấp

Banner dùng public/images/banner-sneakers-hd.png (sao chép từ download.jpeg). Ảnh giữ tỷ lệ gốc bằng width: 100%, height: auto, không có chữ HTML hoặc lớp tối phủ lên. Bản JPEG gốc 270×148 được giữ lại; website dùng bản PNG phục dựng 1694×928 để tránh kéo giãn ảnh nhỏ. Muốn thay tiếp, đổi src của banner trong index.ejs hoặc thay file tương ứng.

### Sửa banner bị vỡ

Ảnh gốc 270×148 không đủ độ phân giải cho banner desktop. Website hiện dùng public/images/banner-sneakers-hd.png, bản phục dựng bằng image_gen 1694×928. Giữ JPEG gốc trong thư mục để đối chiếu. Khung banner cao tối đa 560px; contain giữ toàn bộ bố cục và chữ, nền tối lấp phần dư hai bên. Đây là bản phục dựng bằng AI, không khôi phục chính xác mọi chi tiết từ ảnh nhỏ. Sau khi thay file, Ctrl+F5 để bỏ cache.
