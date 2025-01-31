import multer from 'multer'
import fs from 'fs'
import { ApiError } from "../utils/api-error-utils.js";
import formatValidator from './formatValidation-middleware.js';
// Ensure temp upload directory exists
const uploadDir = './public/temp'
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

// multer.diskStorage is used inorder to store data in the disk
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {
            cb(null, uploadDir)
        } catch (error) {
            cb(error)
        }
    },
    // this is for naming of the file name 
    filename: function (req, file, cb) {
        try {
            const uniqueSuffix = Date.now() + '-' + file.originalname 
            cb(null, file.fieldname + '-' + uniqueSuffix)
        } catch (error) {
            cb(error)
        }
    }
})

//   middleware upload used inorder to upload the file 
const uploadMulter = multer({
  storage: storage,
})

export const upload = (fields) => {
    return (req, res, next) => {
      const multerMiddleware = fields && fields.length > 0 ? uploadMulter.fields(fields) : uploadMulter.none();
      multerMiddleware(req, res, (err) => {
        if (err) {
          console.error('Multer error:', err);
          return next(new ApiError(500, "File upload failed"));
        }
        formatValidator(req, res, next);
      });
    };
  };
// export { upload }
