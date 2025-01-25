import { createVendor, fetchAllVendors, fetchVendor, deleteVendor, updateVendor, updateAvatar } from "./vendor-controller.js";
import Router from 'express'
import { upload } from "../../middlewares/multer-middleware.js";

const vendorRouter = Router()

vendorRouter.route('/create').post(
    upload.fields([{name : 'avatar', maxCount : 1}]), 
    createVendor
)
vendorRouter.route('/updateAvatar').put(
    upload.fields([{name : 'avatar', maxCount : 1}]), 
    updateAvatar
)
vendorRouter.route('/fetchAll').get(fetchAllVendors)
vendorRouter.route('/fetch').get(fetchVendor)
vendorRouter.route('/delete').delete(deleteVendor)
vendorRouter.route('/update').put(updateVendor)

export { vendorRouter }