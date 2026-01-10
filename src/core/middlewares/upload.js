const multer = require('multer');

// Configure storage
const storage = multer.memoryStorage(); // Store files in memory as Buffer

// Filter for image files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit
    },
    fileFilter: fileFilter,
});

module.exports = {
    upload,
};
