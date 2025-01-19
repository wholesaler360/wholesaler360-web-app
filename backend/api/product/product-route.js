import { createProduct , getDiscountTypes } from "./product-controller.js";
import { generateAndSaveImage } from "../../utils/ai-image-generate-utils.js";
import  Router  from "express";
import { upload } from "../../middlewares/multer-middleware.js";
const productRouter = Router();

productRouter.route('/generateImage').get(generateAndSaveImage);

productRouter.route('/createProduct').post(
    upload.fields([{name : 'productImg',maxCount : 1}])
    ,createProduct)

productRouter.route('/discountTypes').get(getDiscountTypes);

export { productRouter };