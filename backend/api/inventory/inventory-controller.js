import "dotenv/config";
import { Product } from "./product-model.js";
import { Category } from "../product-category/product-category-model.js";
import { Tax } from "./tax/tax-model.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import {uploadFile  , deleteFromCloudinary , deleteFromLocalPath,} from "../../utils/cloudinary-utils.js";

const addStock = asyncHandler(async(req,res,next)=>{
    
});