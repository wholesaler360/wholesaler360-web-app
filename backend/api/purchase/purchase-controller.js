import mongoose from "mongoose";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import { Purchase } from "./purchase-model.js";
import { addInventoryService } from "../inventory/inventory-controller.js";
import { createLedgerService } from "../ledger/ledger-controller.js";
import { incrementTrackerService } from "../data-tracker/data-tracker-controller.js"; 


function calculateTaxAndAmounts(products) {
    products.forEach(product => {
        product.taxAmount = parseFloat(((product.unitPrice * product.quantity) * product.taxRate / 100).toFixed(2));
        product.amount = parseFloat(((product.unitPrice * product.quantity) + product.taxAmount).toFixed(2));
    });
    const totalTax = parseFloat(products.reduce((acc, p) => acc + p.taxAmount, 0).toFixed(2));
    const totalAmount = parseFloat(products.reduce((acc, p) => acc + p.amount, 0).toFixed(2));
    return { products, totalTax, totalAmount };
}


const createPurchase = asyncHandler(async (req, res, next) => {
    const { 
        purchaseDate, vendorId, products, transactionType, 
        paymentMode, initialPayment, description 
    } = req.body;
    console.log(initialPayment);
    const purchaseDateObj = new Date(purchaseDate);

    if (transactionType === "debit" && initialPayment <= 0 ) {
        return next(ApiError.validationFailed("Initial payment should be greater than 0"));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Generate a unique purchase number
        const purchaseTracker = await incrementTrackerService("lastPurchaseNumber", purchaseDateObj, session);
        
        if (!purchaseTracker.success) {
            await session.abortTransaction();
            session.endSession();
            return next(ApiError[purchaseTracker.errorType](purchaseTracker.message));
        }

        const purchaseNo = `PUR-${purchaseDateObj.getFullYear()}/${ purchaseTracker.data.lastPurchaseNumber }`;
        console.log('purchaseNo: ', purchaseNo);  

        const { products: computedProducts, totalTax, totalAmount } = calculateTaxAndAmounts(products);
        
        if ( initialPayment > totalAmount ) {
            await session.abortTransaction();
            session.endSession();
            return next(ApiError.validationFailed("Initial payment should be less than or equal to total amount"));
        }

        // Create the purchase
        const purchase = new Purchase({
            purchaseNo,
            purchaseDate: purchaseDateObj,
            vendorId,
            products: computedProducts,
            transactionType,
            paymentMode: transactionType === "debit"? paymentMode : "N/A",
            initialPayment : transactionType === "debit" ? initialPayment : 0,
            description,
            totalTax,
            totalAmount,
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
        const ledgerDataCredit = { vendorId, amount: purchaseCreated.totalAmount, transactionType: "credit", date: purchaseDateObj, description };
        const ledgerResultCredit = await createLedgerService(ledgerDataCredit, req.fetchedUser, session);
        
        if (!(ledgerResultCredit.success)) {  
            await session.abortTransaction();
            session.endSession();
            return next(ApiError[ledgerResultCredit.errorType](ledgerResultCredit.message));
        }

        // create debit entry in the ledger only if transaction type is debit
        if(transactionType === "debit") {
            const ledgerDataDebit = { vendorId, amount: initialPayment, transactionType, paymentMode, date: purchaseDateObj, description };
            const ledgerResultDebit = await createLedgerService(ledgerDataDebit, req.fetchedUser, session);
            
            if (!(ledgerResultDebit.success)) {
                await session.abortTransaction();
                session.endSession();
                return next(ApiError[ledgerResultDebit.errorType](ledgerResultDebit.message));
            }
        }
    
        await session.commitTransaction();
        session.endSession();

        // Filter out unwanted fields
        const{isDeleted, __v, ...remaining} = purchaseCreated.toObject();
        return res.status(201).json(ApiResponse.successCreated(remaining, "Purchase created successfully"));
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(`Error creating purchase: ${error}`);
        if(error.code === 11000) {
            return next(ApiError.dataNotInserted("Duplicate purchase number"));
        }
        return next(ApiError.dataNotInserted("Failed to create purchase"));
    }

});

const fetch = asyncHandler(async (req, res, next) => {
    let { purchaseId } = req.params;
    purchaseId = new mongoose.Types.ObjectId(purchaseId);

    const purchase = await Purchase.findById({_id : purchaseId , isDeleted : false})
    .populate(
        {
            path : "vendorId",
            select : "-_id name"
        }
    
    )
    .populate(
        {
            path : "products.id",
            select : "-_id name"
        }
    )
    .populate(
        {
            path : "createdBy",
            select : "-_id name"
        }
    )
    .select("-isDeleted -__v -updatedAt -createdAt");
    if (!purchase) {
        return next(ApiError.dataNotFound("Purchase not found"));
    }
    res.status(200).json(ApiResponse.successRead(purchase, "Purchase fetched successfully"));
})

const fetchAll = asyncHandler(async (req, res, next) => {
    const purchases = await Purchase.aggregate([
      {
        $match: { isDeleted: false }
      },
      {
        $lookup: {
            from: "vendors",
            localField: "vendorId",
            foreignField: "_id",
            as: "vendor"
        }
      },
      {
        $addFields : {
            purchaseNo : "$purchaseNo",
            purchaseDate : "$purchaseDate",
            vendorName : { $arrayElemAt: ["$vendor.name", 0] },
            totalAmount : "$totalAmount",
            paymentMode : "$paymentMode",
            initialPayment : "$initialPayment",
            transactionType : "$transactionType",
        }
      },
      {
        $project: {
            _id: 1,
            purchaseNo: 1,
            purchaseDate: 1,
            vendorName: 1,
            totalAmount: 1,
            paymentMode: 1,
            initialPayment: 1,
            transactionType: 1
        }
      }
    ])
    if(purchases.length === 0){
        return res.status(200).json(ApiResponse.successRead([], "No purchases found"));
    }
    res.status(200).json(ApiResponse.successRead(purchases, "Purchases fetched successfully"));
})

export { createPurchase, fetch, fetchAll };