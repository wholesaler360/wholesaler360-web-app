import { generateAndSaveImage } from "../../utils/ai-image-generate-utils.js";
import  Router  from "express";
const productRouter = Router();

productRouter.route('/generateImage').get(generateAndSaveImage);

export { productRouter };