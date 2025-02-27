import { createCategory , updateCategory , deleteCategory ,getCategory, getAllCategories } from "./product-category-controller.js";
import { Router } from "express";

const categoryRouter = Router();

categoryRouter.post('/createCategory', createCategory);

categoryRouter.put('/updateCategory', updateCategory);

categoryRouter.delete('/deleteCategory', deleteCategory);

categoryRouter.get('/getCategory/:name', getCategory);

categoryRouter.get('/getAllCategories', getAllCategories);

export { categoryRouter };