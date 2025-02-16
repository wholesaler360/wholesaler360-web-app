import "dotenv/config";
import { Batch } from "../batch/batch-model.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { Inventory } from "../inventory/inventory-model.js";
import mongoose from "mongoose";

const fetchAllBatch = asyncHandler(async (req, res, next) => {
  try {
    let productId = req.body.productId;
    if (!productId) {
      return next(ApiError.validationFailed("Please provide productId"));
    }
    productId = new mongoose.Types.ObjectId(productId); // Convert to Mongoose ObjectId
    console.log(productId);

    const inventory = await Inventory.aggregate([
      {
        $match: { productId: productId }
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: "$batches"
      },
      {
        $lookup: {
          from: "batches",
          localField: "batches.batch",
          foreignField: "_id",
          as: "batch"
        }
      },
      {
        $unwind: "$batch"
      },
      {
        $lookup: {
          from: "purchases",
          localField: "batch.purchaseId",
          foreignField: "_id",
          as: "purchase"
        }
      },
      {
        $unwind: "$purchase"
      },
      {
        $lookup : {
          from : "vendors",
          localField : "purchase.vendorId",
          foreignField : "_id",
          as : "vendor"
        }
      },
      {
        $group: {
          _id: "$productId",
          productName: { $first: { $arrayElemAt: ["$product.name", 0] } },
          skuCode: { $first: { $arrayElemAt: ["$product.skuCode", 0] } },
          batches: {
            $push: {
              batchNo: "$batches.batchNo",
              purchasePrice: "$batch.purchasePrice",
              salePriceWithoutTax: "$batch.salePriceWithoutTax",
              isSalePriceEntered: "$batch.isSalePriceEntered",
              purchaseNo : "$purchase.purchaseNo",
              purchaseDate : "$purchase.purchaseDate",
              vendorName : { $arrayElemAt : ["$vendor.name", 0] },
              isDeleted: "$batch.isDeleted"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          productName: 1,
          skuCode: 1,
          batches: 1
        }
      }
    ]);
    console.log(inventory);
    if(inventory.length === 0){
      return next(ApiError.dataNotFound("No batches found"));
    }
    res.status(200).json(ApiResponse.successRead(inventory[0], "Batches fetched successfully"));
  } catch (error) {
    console.log(error);
    return next(ApiError.dataNotFound("Failed to fetch batches"));
  }
});

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
export { fetchAllBatch };