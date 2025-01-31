import multer from 'multer'
import fs from 'fs'
import { ApiError } from "../utils/api-error-utils.js";

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
export const upload = multer({
  storage: storage,
  error: function (error, req, res, next) {
    console.error('Multer error:', error)
    return next(new ApiError(500, "File upload failed"));
  }
})
