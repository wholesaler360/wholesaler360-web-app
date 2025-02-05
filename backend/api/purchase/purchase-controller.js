import mongoose from "mongoose";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import { Purchase } from "./purchase-model.js";
import { addInventoryService } from "../inventory/inventory-controller.js";
import { createLedgerService } from "../ledger/ledger-controller.js";


const createPurchase = asyncHandler(async (req, res, next) => {
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
        // Generate a unique purchase number
        // const purchaseNo = `PUR-${purchaseDateObj.getFullYear()}/${}`;
        const purchaseNo = `PUR-2025/1`;

        // Create the purchase
        const purchase = new Purchase({
            purchaseNo,
            purchaseDate: purchaseDateObj,
            vendorId,
            products,
            transactionType,
            paymentMode: paymentMode === "debit"? paymentMode : "N/A",
            initialPayment : transactionType === "debit" ? initialPayment : 0,
            description,
            createdBy: req.fetchedUser._id,
        });
        
        const purchaseCreated = await purchase.save({ session });
        
        if (!purchaseCreated) {
            await session.abortTransaction();
            session.endSession();
            return next(ApiError.dataNotInserted("Failed to create purchase"));
        }

        // Add inventory for the products
        const InventoryData = { products, purchaseRef: purchaseCreated._id };
        const inventoryResult = await addInventoryService(InventoryData, session);
        
        if (!(inventoryResult.success)) {
            await session.abortTransaction();
            session.endSession();
            return next(ApiError[inventoryResult.errorType](inventoryResult.message));
        }

        // Create the credit entry in the ledger
        const ledgerDataCredit = { vendorId, amount: purchaseCreated.totalAmount, transactionType: "credit" };
        const ledgerResultCredit = await createLedgerService(ledgerDataCredit, session);
        
        if (!(ledgerResultCredit.success)) {  
            await session.abortTransaction();
            session.endSession();
            return next(ApiError[ledgerResultCredit.errorType](ledgerResultCredit.message));
        }

        // create debit entry in the ledger only if transaction type is debit
        if(transactionType === "debit") {
            const ledgerDataDebit = { vendorId, amount: initialPayment, transactionType, paymentMode };
            const ledgerResultDebit = await createLedgerService(ledgerDataDebit, session);
            
            if (!(ledgerResultDebit.success)) {
                await session.abortTransaction();
                session.endSession();
                return next(ApiError[ledgerResultDebit.errorType](ledgerResultDebit.message));
            }
        }
    
        await session.commitTransaction();
        session.endSession();
        return res.status(201).json(ApiResponse.successCreated(purchaseCreated, "Purchase created successfully"));
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(`Error creating purchase: ${error}`);
        return next(ApiError.dataNotInserted("Failed to create purchase"));
    }

});

export { createPurchase };