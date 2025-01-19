import { createVendor, fetchAllVendors, fetchVendorById } from "./vendor-controller.js";
import Router from 'express'
import { upload } from "../../middlewares/multer-middleware.js";

const vendorRouter = Router()

vendorRouter.route('/createVendor').post(
    upload.fields([{name : 'avatar', maxCount : 1}]), 
    createVendor
)
vendorRouter.route('/fetchAllVendors').get(fetchAllVendors)
vendorRouter.route('/vendor/:vendorId').get(fetchVendorById)

export { vendorRouter }