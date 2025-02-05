import mongoose from "mongoose";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import { Purchase } from "./purchase-model.js";
import { addInventoryService } from "../inventory/inventory-controller.js";


export const createPurchase = asyncHandler(async (req, res, next) => {
    const { 
        purchaseDate, vendorId, products, transactionType, 
        paymentMode, initialPayment, description 
    } = req.body;

    const today = new Date();
    const purchaseDateObj = new Date(purchaseDate);

    // Ensure requirement of Purchase date and validate it 
    if (!purchaseDate || isNaN(purchaseDateObj.getTime())) {
        return next(ApiError.validationFailed("Please provide purchase date"));
    }

    if (purchaseDateObj > today) {
        return next(ApiError.validationFailed("Purchase date cannot be in the future"));
    }

    if (transactionType === "debit" && initialPayment <1) {
        return next(ApiError.validationFailed("Initial payment should be greater than 0"));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Create a unique purchase number
        // const purchaseNo = `PUR-${purchaseDateObj.getFullYear()}/${}`;

        // create below not created variables
        const purchase = new Purchase({
            purchaseNo,
            purchaseDate: purchaseDateObj,
            vendorId,
            products,
            transactionType,
            paymentMode: paymentMode === "debit"? paymentMode : "N/A",
            initialPayment : transactionType === "debit" ? initialPayment : 0,
            description,
        });
        
        const purchaseCreated = await purchase.save({ session });
        
        if (!purchaseCreated) {
            await session.abortTransaction();
            session.endSession();
            return next(ApiError.dataNotInserted("Failed to create purchase"));
        }

        const purchaseRef = purchaseCreated._id;

        InventoryData = { products, purchaseRef };
        const inventoryResult = await addInventoryService(InventoryData, req.fetchedUser);
        
        if (!(inventoryResult.success)) {
            await session.abortTransaction();
            session.endSession();
            return next(ApiError[inventoryResult.errorType](inventoryResult.message));
        }
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(`Error creating purchase: ${error}`);
        return next(ApiError.dataNotInserted("Failed to create purchase"));
    }
});