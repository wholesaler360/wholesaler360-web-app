import { createVendor, fetchAllVendors, fetchVendorsList, fetchVendor, deleteVendor, updateVendor, updateAvatar } from "./vendor-controller.js";
import Router from 'express'
import { upload } from "../../middlewares/multer-middleware.js";

const vendorRouter = Router()

vendorRouter.route('/create').post(
    upload([{name : 'avatar', maxCount : 1}]), 
    createVendor
)
vendorRouter.route('/updateAvatar').put(
    upload([{name : 'avatar', maxCount : 1}]), 
    updateAvatar
)
vendorRouter.route('/fetchAll').get(fetchAllVendors)
vendorRouter.route('/fetch').post(fetchVendor)
vendorRouter.route('/delete').delete(deleteVendor)
vendorRouter.route('/fetchList').get(fetchVendorsList)

// Need to use multer to handle form data even if there are no files
vendorRouter.route('/update').put(upload(), updateVendor)

export { vendorRouter }