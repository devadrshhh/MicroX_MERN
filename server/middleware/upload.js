const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'microx_pdfs',
    resource_type: 'raw',
    type: 'upload',
    public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`,
  }),
});
  cloudinary,
  params: {
    folder: 'microx_pdfs',
    resource_type: 'raw',
    public_id: (req, file) => Date.now() + '-' + file.originalname,
  },
});

const upload = multer({ storage });

module.exports = upload;