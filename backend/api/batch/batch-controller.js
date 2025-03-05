import "dotenv/config";
import { Batch } from "../batch/batch-model.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { Inventory } from "../inventory/inventory-model.js";
import mongoose from "mongoose";

const fetchAllBatch = asyncHandler(async (req, res, next) => {
  try {
    let { productId } = req.params;
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
        $match :{
          "batch.isDeleted" : false
        }
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
        $lookup : {
          from : "users",
          localField : "purchase.createdBy",
          foreignField : "_id",
          as : "user"
        }
      },
      {
        $group: {
          _id: "$productId",
          productName: { $first: { $arrayElemAt: ["$product.name", 0] } },
          skuCode: { $first: { $arrayElemAt: ["$product.skuCode", 0] } },
          batches: {
            $push: {
              batchId: "$batch._id",
              batchNo: "$batches.batchNo",
              purchasePrice: "$batch.purchasePrice",
              currentQuantity: "$batch.currentQuantity",
              salePriceWithoutTax: "$batch.salePriceWithoutTax",
              isSalePriceEntered: "$batch.isSalePriceEntered",
              purchaseNo : "$purchase.purchaseNo",
              purchaseDate : "$purchase.purchaseDate",
              vendorName : { $arrayElemAt : ["$vendor.name", 0] },
              createdBy : { $arrayElemAt : ["$user.name", 0] }
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

const changeSellingPrice = asyncHandler(async(req,res,next)=>{
    const {batchId ,sellingPrice } = req.body;
    if(!batchId || sellingPrice==null || sellingPrice==undefined){
      return next(ApiError.validationFailed("Please provide batchId and sellingPrice"));
    }

    if(sellingPrice <= 0){
      return res.status(200).json(ApiResponse.successRead(null,"Selling price cannot be negative or zero"));
    }

    try {
    const batch = await Batch.findOne({ _id: batchId , isDeleted : false});
    if(!batch){
        return next(ApiError.dataNotFound("Batch does not exists or deleted"));
    }
    if(batch.purchasePrice > sellingPrice){
      return res.status(200).json(ApiResponse.successRead(null,"Selling price cannot be less than purchase price"));
    }
    batch.salePriceWithoutTax = sellingPrice;
    batch.isSalePriceEntered = true;
    await batch.save();
    const {purchaseId , _id , isDeleted, __v, createdAt, updatedAt, ...remainingBatch} = batch.toObject();
    res.status(200).json(ApiResponse.successUpdated(remainingBatch,"Selling price updated successfully"));
    
  } catch (error) {
    return next(ApiError.dataNotFound("Failed to update selling price"));
  }

});

const stockAdd = asyncHandler(async(req,res,next)=>{
  const {skuCode, purchasePrice, salePriceWithoutTax, purchaseDate} = req.body;
});

const stockOut = asyncHandler(async(req,res,next)=>{

});
export { fetchAllBatch , changeSellingPrice};