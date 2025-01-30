
import { createProduct , updateProduct , updateProductImage , getProduct , fetchAllProduct, getDiscountTypes , fetchProductDropdown,deleteProduct} from "./product-controller.js";

import { generateAndSaveImage } from "../../utils/ai-image-generate-utils.js";
import Router from "express";
import { upload } from "../../middlewares/multer-middleware.js";
const productRouter = Router();


productRouter.route('/generateImage').post(generateAndSaveImage);


productRouter.route("/fetchAllProduct").get(fetchAllProduct);

productRouter.route("/fetchProduct").post(getProduct);

productRouter.route("/discountTypes").get(getDiscountTypes);

productRouter
  .route("/createProduct")
  .post(upload.fields([{ name: "productImg", maxCount: 1 }]), createProduct);

productRouter.route("/updateProduct").put(updateProduct);

productRouter
  .route("/updateProductImage")
  .put(
    upload.fields([{ name: "productImg", maxCount: 1 }]),
    updateProductImage
  );

productRouter.route('/fetchProductDropdown').get(fetchProductDropdown);

productRouter.route('/deleteProduct').delete(deleteProduct);
export { productRouter };

