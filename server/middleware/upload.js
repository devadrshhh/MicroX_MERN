const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'microx_pdfs',
    resource_type: 'auto',
    type: 'upload',
    public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`,
  }),
});

const upload = multer({ storage });

module.exports = upload;