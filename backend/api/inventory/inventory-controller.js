import "dotenv/config";
import { Inventory } from "./inventory-model.js";
import { Batch } from "../batch/batch-model.js";
import { ApiError } from "../../utils/api-error-utils.js";

const addPurchaseStock = async (purchase, next) => {
  if (!purchase) {
    return next(ApiError.validationFailed("Purchase is required to Add Stock to Inventory"));
  }

  const productArray = await purchase.products;

  const inventoryUpdates = productArray.map(async (element) => {
    const batch = await Batch.create({
      purchaseId: purchase._id,
      currentQuantity: element.quantity,
      purchasePrice: element.price,
    });

    let inventoryOfProduct = await Inventory.findOne({ productId: element.id });
    if (!inventoryOfProduct) {
      inventoryOfProduct = await Inventory.create({ productId: element.id, batches: [] });
    }

    const batchNo = (inventoryOfProduct.batches.length > 0)
      ? inventoryOfProduct.batches[inventoryOfProduct.batches.length - 1].batchNo + 1
      : 1;

    inventoryOfProduct.batches.push({ batchNo, batchId: batch._id });
    return inventoryOfProduct.save();
  });

  await Promise.all(inventoryUpdates);
};

export { addPurchaseStock };