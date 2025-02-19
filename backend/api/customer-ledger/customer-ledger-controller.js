import mongoose from "mongoose";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { CustomerLedger } from "./customer-ledger-model.js";
import { Customer } from "../customer/customer-model.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";


// --------------------- Service functions ---------------------- \\
const createCustomerLedgerService = async (data, fetchedUser, session) => {
    const { customerId, amount, transactionType, paymentMode, date, description } = data;
    
    if ([
            customerId, amount, transactionType, date

        ].some((field) => 
            typeof field === "string" ? !field.trim() : !field
        )  
    ) {
        return {success: false, errorType: "validationFailed", message: "Please provide all required fields", data: null};
    }

    const today = new Date();
          
    // Ensure requirement of date and validate it 
    if (!date || isNaN(date.getTime())) {
        return { success: false, errorType: "validationFailed", message: "Please provide the date", data: null };
    }
    
    if (date > today) {
        return { success: false, errorType: "validationFailed", message: "Date cannot be in the future", data: null };
    }

    if (transactionType === "credit" && !["cash", "cheque", "upi", "online"].includes(paymentMode)) {
        return { success: false, errorType: "validationFailed", message: "Invalid payment mode", data: null };
    }

    try{
        const customer = await Customer.findById(customerId).session(session);

        if (!customer || customer.isDeleted) {
            return { success: false, errorType: "dataNotFound", message: "Customer not found", data: null };
        }

        // Calculate the payable balance after the transaction
        let receivableBalance;

        if (transactionType === "debit") {
            receivableBalance = customer.receivableBalance + amount;
        } else if (transactionType === "credit") {
            receivableBalance = customer.receivableBalance - amount;
        } else {
            return { success: false, errorType: "validationFailed", message: "Invalid transaction type", data: null };
        }

        if (receivableBalance < 0) {
            return { success: false, errorType: "validationFailed", message: "You are taking more than receivableBalance balance from customer", data: null };
        }

        customer.receivableBalance = receivableBalance;
        console.log("receivableBalance: ", receivableBalance);
        await customer.save({ session });

        // Create the ledger entry
        const customerLedgerEntry = await CustomerLedger.create([
            {
                createdBy: fetchedUser._id,
                customerId,
                date,
                amount,
                transactionType,
                paymentMode: transactionType === "credit" ? paymentMode : "N/A",
                receivableBalance,
                description
            }],
            { session }
        );

        const {isDeleted, _id, updatedAt, __v, ...remaining} = customerLedgerEntry[0].toObject();

        return { success: true, errorType: null, message: "Customer ledger created successfully", data: remaining };
    }
    catch (error) {
        console.log(error);
        return { success: false, errorType: "dataNotInserted", message: "Failed to create customer ledger", data: null };
    }
};


// --------------------- Controller functions ---------------------- \\
const createCustomerLedger = asyncHandler(async(req, res, next)=>{
    try{
        const DateObj = new Date(req.body.date);
        req.body.date = DateObj;    
        
        const session = await mongoose.startSession();
        session.startTransaction();

        const result = await createCustomerLedgerService(req.body, req.fetchedUser, session);

        if (result.success) {
            await session.commitTransaction();
            session.endSession();
            return res.status(201).json(ApiResponse.successCreated(result.data, result.message));
        } else {
            await session.abortTransaction();
            session.endSession();
            return next(ApiError[result.errorType](result.message));
        }
    }
    catch(error){
        if ( session ){
            await session.abortTransaction();
            session.endSession();
        }
        console.log("Create Customer Ledger Error: " + error);
        return next(new ApiError(500, "Failed to create customer ledger"));
    }
});


const showCustomerLedger = asyncHandler (async(req, res, next) => {
    const { customerId } = req.body;

    if (!customerId) {
        return next(ApiError.validationFailed("Please provide customer Id"));
    }

    const ledger = await CustomerLedger.find({ 
        customerId, isDeleted: false 
        },
        { __v: 0, isDeleted: 0, updatedAt: 0 }
    ).sort({ createdAt: -1 }); // Latest first

    if (!ledger || ledger.length === 0) {
        return next(ApiError.dataNotFound("No ledger found"));
    }
    
    return res.status(200).json(ApiResponse.successRead(ledger, "Customer ledger fetched successfully"));
});


export { showCustomerLedger, createCustomerLedgerService, createCustomerLedger };