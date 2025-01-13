import multer from 'multer'

// multer.diskStorage is used inorder to store data in the disk
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    // this is for naming of the file name 
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + file.originalname 
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  
//   middleware upload used inorder to upload the file 
export const upload = multer({ storage : storage })