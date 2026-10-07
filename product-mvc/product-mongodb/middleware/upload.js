const multer = require('multer');
const path = require('path');
const { randomUUID } = require('crypto');
const types = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp'
};
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/uploads'),
    filename: (req, file, cb) => cb(null, randomUUID() + types[file.mimetype])
});
module.exports = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024, files: 5, fields: 5 },
    fileFilter: (req, file, cb) => {
        if (types[file.mimetype]) {
            return cb(null, true);
        }

        const error = new Error(
            'Chỉ nhận ảnh JPG, PNG hoặc WEBP, tối đa 2 MB.'
        );
        error.status = 400;
        cb(error);
    }
});
