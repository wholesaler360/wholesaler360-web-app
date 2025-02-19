import "dotenv/config";
import { Inventory } from "./inventory-model.js";
import { Batch } from "../batch/batch-model.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { Product } from "../product/product-model.js";
import mongoose, { disconnect } from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";

// --------------------- Add Purchase Stock Service function---------------------- \\
const addInventoryService = async (purchaseData, session) => {
  console.log("--------------Internal Inventory Purchase Operation--------------");
  // It Confirms that purchase reaches here
  if (!purchaseData) {
    return {
      success: false,
      errorType: "validationFailed",
      message: "Please provide purchaseData details",
      data: null,
    };
  }

  // It takes out the product array from the purchase Data and validate it
  const productArray = purchaseData?.products;
  if (!productArray || productArray.length === 0) {
    return {
      success: false,
      errorType: "validationFailed",
      message: "Please provide products",
      data: null,
    };
  }
  console.log("Product Array:\n",productArray);

  // It takes out the product Ids from the product array 
  // and validate all fields /O(no. of products in purchase)\
  const productIds = [];
  for (const element of productArray) {
    if (
      element.id &&
      element.quantity > 0 &&
      element.unitPrice > 0 &&
      ( element.taxRate >= 0 && element.taxRate <= 100 )
    ) {
      productIds.push(element.id);
    } else {
      return {
        success: false,
        errorType: "validationFailed",
        message: "Please provide valid product details",
        data: null,
      };
    }
  }
  console.log("Product Ids:\n",productIds);
  
  try {
    // fetches all the product in array with one query from the database 
    // and validate it if all products exists /O(all products)\
    const fetchedProducts = await Product.find(
      { _id: { $in: productIds }, isProductDeleted: false },
      { _id : 1 ,salePrice: 1 }
    ).session(session);

    console.log("Fetched PRoduct:\n",fetchedProducts);

    if (fetchedProducts.length !== productArray.length) {
      return {
        success: false,
        errorType: "dataNotFound",
        message: "One or more product not found",
        data: null,
      };
    }

    // Create batches of all the products and insert it in the database
    // O(no. of products in purchase)
    const batches = productArray.map((element) => ({
      purchaseId: purchaseData.purchaseRef,
      currentQuantity: element.quantity,
      purchasePrice: parseFloat(
        (((element.unitPrice*element.quantity)*(1 + element.taxRate/100))/element.quantity)
        .toFixed(2)),
      salePriceWithoutTax: fetchedProducts.find(
        (product) => product._id.toString() === element.id.toString()
      ).salePrice,
    }));
    console.log("Batches : ",batches);
    // // O(no. of products in purchase)
    const createdBatches = await Batch.insertMany(batches, { session });

    const inventoryUpdates = createdBatches.map(async (batch, index) => {
      //Index just iterate overall the element of product array
      const element = productArray[index];
      
      let inventoryOfProduct = await Inventory.findOne({
        productId: element.id,
      }).session(session);
      
      if (!inventoryOfProduct) {
        const createdDoc = await Inventory.create(
          [{ productId: element.id, batches: [], totalQuantity: 0 }],
          { session }
        );
        inventoryOfProduct = createdDoc[0];
      }

      const batchNo =
        inventoryOfProduct.batches.length > 0
          ? inventoryOfProduct.batches[inventoryOfProduct.batches.length - 1]
              .batchNo + 1 : 1;
      console.log("Batch No : ",batchNo);
      inventoryOfProduct.batches.push({ batchNo, batch: batch._id });
      inventoryOfProduct.totalQuantity += element.quantity;
      return inventoryOfProduct.save({ session });
    });

    const createdStock = await Promise.all(inventoryUpdates);
    console.log("--------------Internal Inventory Operation End--------------");
    return {
      success: true,
      errorType: null,
      message: "Successfully inserted in the inventory",
      data: null,
    };

  } catch (error) {
    console.log("Error in Internal Inventory Operation: ",error);
    return {
      success: false,
      errorType: "dataNotInserted",
      message: "Failed to insert in the inventory",
      data: error.message,
    };
  }
};
// --------------------- Add Purchase Stock Service function Ends------------------ \\

const stockDeductionInventoryService = async(invoiceData, session)=> {
  try {
    console.log("--------------Internal Inventory Operation Start--------------");
    if(!invoiceData){
      return {
        success: false,
        errorType: "validationFailed",
        message: "Please provide invoice data details",
        data: null
      };
    }
    const productArray = invoiceData?.products;

    const inventories = await Inventory.find({
      productId: { $in: productArray.map(p => p.id) }
    }).populate({
      path: "batches.batch",
      match: { isDeleted: false }
    }).select("batches totalQuantity productId").session(session);
    console.log("Inventories:\n",inventories);
    
    const bulkBatchUpdates = [];
    const bulkInventoryUpdates = [];

    for (const element of productArray) {
      const inventory = inventories.find(inv => inv.productId.equals(element.id));

      if (!inventory || inventory.totalQuantity < element.quantity) {
        return {
          success: false,
          errorType: "dataNotFound",
          message: "One or more products not found",
          data: null
        };
      }

      let remainingQuantity = element.quantity;

      for (const batch of inventory.batches) {
        if (batch.batch.currentQuantity > 0) {
          const quantity = Math.min(remainingQuantity, batch.batch.currentQuantity);
          remainingQuantity -= quantity;
          batch.batch.currentQuantity -= quantity;

          bulkBatchUpdates.push({
            updateOne: {
              filter: { _id: batch.batch._id },
              update: { $set: { currentQuantity: batch.batch.currentQuantity, isDeleted: batch.batch.currentQuantity === 0 } }
            }
          });

          if (remainingQuantity === 0) break;
        }
        console.log("Bulk Updates\n",bulkBatchUpdates);
      }

      bulkInventoryUpdates.push({
        updateOne: {
          filter: { productId: element.id },
          update: { $inc: { totalQuantity: -element.quantity } }
        }
      });
      console.log("Bulk Inventory Updates\n",bulkInventoryUpdates);
    }

    if (bulkBatchUpdates.length) await Batch.bulkWrite(bulkBatchUpdates, { session });
    if (bulkInventoryUpdates.length) await Inventory.bulkWrite(bulkInventoryUpdates, { session });

    console.log("--------------Internal Inventory Operation End--------------");

    return {
      success: true,
      errorType: null,
      message: "Successfully stock deducted from the inventory",
      data: null
    };

  } catch (error) {
    console.log("Error in Internal Inventory Operation: ", error);
    return {
      success: false,
      errorType: "dataNotInserted",
      message: "Failed to deduct stock from inventory",
      data: error.message
    };
  }
};
// ---------------------Remove Invoice Stock Service function Ends------------------\\

const fetchInventory = asyncHandler(async (req, res, next) => {
  const inventory = await Product.aggregate([
    {
      $match: { isProductDeleted: false }
    },
    {
      $lookup: {
        from: "inventories",
        localField: "_id",
        foreignField: "productId",
        as: "inventory",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $addFields: {
        productInfo: {
          id: "$_id",
          name: "$name",
          skuCode: "$skuCode",
          productImg: "$productImg",
          category: { $arrayElemAt: ["$category.name", 0] },
          totalQuantity: {
            $cond: {
              if: { $gt: [{ $size: "$inventory" }, 0] },
              then: { $arrayElemAt: ["$inventory.totalQuantity", 0] },
              else: 0
            }
          }
        }
      }
    },
    {
      $group:{
        _id: null,
        product: { $push: "$productInfo" }
      }
    },
    {
      $project: {
        _id: 0,
        product: 1
      }
    }
  ]);
  if(inventory.length === 0) {
    return res.status(200).json(ApiResponse.successRead("No Products exists"));
  }
  res.status(200).json(ApiResponse.successRead(inventory[0], "Inventory fetched successfully"));
});



export { 
  addInventoryService,
  stockDeductionInventoryService,
  fetchInventory 
};
