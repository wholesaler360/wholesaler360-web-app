import "dotenv/config";
import { Batch } from "../batch/batch-model.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { Inventory } from "../inventory/inventory-model.js";

const fetchAllBatch = asyncHandler(async(req,res,next)=>{
    try {
      const { productId } = req.body;
      if(!productId){
        return next(ApiError.validationFailed("Please provide productId"));
      }
      const inventory = await Inventory.findOne({ productId }).populate({path : 'batches.batch'});
    
      if(!inventory){
        return next(ApiError.dataNotFound("No inventory found"));
      }
    
      res.status(200).json(ApiResponse.successRead(inventory.batches, "Batches fetched successfully"));
    } catch (error) {
      console.log(error);
      return next(ApiError.dataNotFound("Failed to fetch batches"));
    }
  
  })

// const changeSellingPrice = asyncHandler(async(req,res,next)=>{
//     const { productId, batchNo, sellingPrice } = req.body;
//     if(!productId || !batchNo || !sellingPrice){
//       return next(ApiError.validationFailed("Please provide productId, batchNo and sellingPrice"));
//     }

//     try {
//     const inventory = await Inventory.findOne({ productId });
//     if(!inventory){
//         return next(ApiError.dataNotFound("No inventory found"));
//     }

// });
  export {fetchAllBatch}