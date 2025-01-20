import { createProduct , getProduct , fetchAllProduct, getDiscountTypes , deleteProduct} from "./product-controller.js";
import { generateAndSaveImage } from "../../utils/ai-image-generate-utils.js";
import  Router  from "express";
import { upload } from "../../middlewares/multer-middleware.js";
const productRouter = Router();

productRouter.route('/generateImage').get(generateAndSaveImage);

productRouter.route('/fetchAllProduct').get(fetchAllProduct);

productRouter.route('/fetchProduct').get(getProduct);

productRouter.route('/discountTypes').get(getDiscountTypes);

productRouter.route('/createProduct').post(
    upload.fields([{name : 'productImg',maxCount : 1}])
    ,createProduct)

productRouter.route('/deleteProduct').delete(deleteProduct);
export { productRouter };