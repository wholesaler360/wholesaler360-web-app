import mongoose from "mongoose";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { Ledger } from "./ledger-model.js";
import { Vendor } from "../vendors/vendor-model.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";


// --------------------- Service functions ---------------------- \\
const createLedgerService = async (data, fetchedUser) => {
    const { vendorId, amount, transactionType, paymentMode, description } = data;

    console.log(vendorId, amount, transactionType, paymentMode, description);
    if ([
        vendorId, amount, transactionType

    ].some((field) => 
        typeof field === "string" ? !field.trim() : !field
    )  
    ) {
        return {success: false, errorType: "validationFailed", message: "Please provide all required fields", data: null};
    }

    if (transactionType === "debit" && !["cash", "cheque", "upi", "online"].includes(paymentMode)) {
        return { success: false, errorType: "validationFailed", message: "Invalid payment mode", data: null };
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const vendor = await Vendor.findById(vendorId).session(session);

        if (!vendor || vendor.isDeleted) {
            await session.abortTransaction();
            session.endSession();
            return { success: false, errorType: "dataNotFound", message: "Vendor not found", data: null };
        }

        // Calculate the payable balance after the transaction
        let payableBalance;

        if (transactionType === "credit") {
            payableBalance = vendor.payableBalance + amount;
        } else if (transactionType === "debit") {
            payableBalance = vendor.payableBalance - amount;
        } else {
            await session.abortTransaction();
            session.endSession();
            return { success: false, errorType: "validationFailed", message: "Invalid transaction type", data: null };
        }

        if (payableBalance < 0) {
            await session.abortTransaction();
            session.endSession();
            return { success: false, errorType: "validationFailed", message: "You are paying more than payable balance", data: null };
        }

        vendor.payableBalance = payableBalance;
        await vendor.save({ session });

        // Create the ledger entry
        const ledgerEntry = await Ledger.create([
            {
                createdBy: fetchedUser._id,
                vendorId,
                amount,
                transactionType,
                paymentMode: transactionType === "debit" ? paymentMode : "N/A",
                payableBalance,
                description
            }],
            { session }
        );

        const {isDeleted, _id, updatedAt, __v, ...remaining} = ledgerEntry[0].toObject();

        await session.commitTransaction();
        session.endSession();

        return { success: true, errorType: null, message: "Ledger created successfully", data: remaining };
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error);
        return { success: false, errorType: "dataNotInserted", message: "Failed to create ledger", data: null };
    }
};


// --------------------- Controller functions ---------------------- \\
const createLedger = asyncHandler(async(reqOrData, res, next)=>{
    console.log(reqOrData.fetchedUser);
    const result = await createLedgerService(reqOrData.body, reqOrData.fetchedUser);

    if (result.success) {
        return res.status(201).json(ApiResponse.successCreated(result.data, result.message));
    } else {
        return next(ApiError[result.errorType](result.message));
    }
});


const showLedger = asyncHandler (async(req, res, next) => {
    const { vendorId } = req.body;

    if (!vendorId) {
        return next(ApiError.validationFailed("Please provide vendorId"));
    }

    const ledger = await Ledger.find({ 
        vendorId, isDeleted: false 
        },
        { __v: 0, isDeleted: 0, updatedAt: 0 }
    ).sort({ createdAt: -1 }); // Latest first

    return res.status(200).json(ApiResponse.successRead(ledger, "Ledger fetched successfully"));
});

export { createLedger, showLedger};
