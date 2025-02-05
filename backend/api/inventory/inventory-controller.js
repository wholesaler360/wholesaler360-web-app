import "dotenv/config";
import { Inventory } from "./inventory-model.js";
import { Batch } from "../batch/batch-model.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { Product } from "../product/product-model.js";
import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";

// --------------------- Add Purchase Stock Service function---------------------- \\
const addInventoryService = async (purchaseData, session) => {
  console.log("--------------Internal Inventory Operation--------------");
  if (!purchaseData) {
    return {
      success: false,
      errorType: "validationFailed",
      message: "Please provide purchaseData details",
      data: null,
    };
  }

  const productArray = purchaseData?.products;
  if (!productArray || productArray.length === 0) {
    return {
      success: false,
      errorType: "validationFailed",
      message: "Please provide products",
      data: null,
    };
  }

  const productIds = [];
  for (const element of productArray) {
    if (
      element.id &&
      element.quantity > 0 &&
      element.price > 0 &&
      element.taxRate >= 0 &&
      element.taxRate <= 100
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

  try {
    const fetchedProducts = await Product.find(
      { _id: { $in: productIds }, isProductDeleted: false },
      { _id: 1, salePrice: 1 }
    ).session(session);

    if (fetchedProducts.length !== productArray.length) {
      return {
        success: false,
        errorType: "dataNotFound",
        message: "One or more product not found",
        data: null,
      };
    }

    const batches = productArray.map((element) => ({
      purchaseId: purchaseData.purchaseRef,
      currentQuantity: element.quantity,
      purchasePrice: element.price,
      salePriceWithoutTax: fetchedProducts.find(
        (product) => product._id === element.id
      ).salePrice,
    }));

    const createdBatches = await Batch.insertMany(batches, { session });

    const inventoryUpdates = createdBatches.map(async (batch, index) => {
      const element = productArray[index];
      
      let inventoryOfProduct = await Inventory.findOne({
        productId: element.id,
      }).session(session);
      if (!inventoryOfProduct) {
        inventoryOfProduct = await Inventory.create(
          [{ productId: element.id, batches: [], totalQuantity: 0 }],
          { session }
        );
      }

      const batchNo =
        inventoryOfProduct.batches.length > 0
          ? inventoryOfProduct.batches[inventoryOfProduct.batches.length - 1]
              .batchNo + 1 : 1;

      inventoryOfProduct.batches.push({ batchNo, batch: batch._id });
      inventoryOfProduct.totalQuantity += element.quantity;
      return inventoryOfProduct.save({ session });
    });

    await Promise.all(inventoryUpdates);
    console.log("--------------Internal Inventory Operation End--------------");
    return {
      success: true,
      errorType: null,
      message: "Successfully inserted in the inventory",
      data: null,
    };

  } catch (error) {
    console.log(error);
    return {
      success: false,
      errorType: "dataNotInserted",
      message: "Failed to insert in the inventory",
      data: error.message,
    };
  }
};

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
      $addFields: {
        productInfo: {
          id: "$_id",
          name: "$name",
          skuCode: "$skuCode",
          productImg: "$productImg",
          category: "$category",
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
      $project: {
        _id: 0,
        productInfo: 1
      }
    }
  ]);
  if(inventory.length === 0) {
    return res.status(200).json(ApiResponse.successRead("No Products exists"));
  }
  res.status(200).json(ApiResponse.successRead(inventory, "Inventory fetched successfully"));
});

export { addInventoryService, fetchInventory };
