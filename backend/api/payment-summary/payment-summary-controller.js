import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import { Ledger } from "../ledger/ledger-model.js";
import { CustomerLedger } from "../customer-ledger/customer-ledger-model.js";

const getAllPayments = asyncHandler(async (req, res, next) => {
    const allVendorLedger = await Ledger.aggregate([
        {
            $match: { isDeleted: false, transactionType: "debit" }
        },
        {
            $lookup : {
                from : "vendors",
                localField : "vendorId",
                foreignField : "_id",
                as : "vendor"
            }
        },
        {
            $project : {
                _id : 0,
                vendorName : { $arrayElemAt: ["$vendor.name", 0] },
                amount : 1,
                date: 1,
                transactionType : 1,
                description : 1,
                paymentMode : 1,
                createdAt : 1
            }
        },
        {
            $sort: { createdAt: -1 } // Sort vendor transactions by createdAt in descending order
        }
    ])

    if(!allVendorLedger?.length) {
        return res.status(200).json(ApiResponse.successRead([],"No payments found"));
    }

    const allCustomerLedger = await CustomerLedger.aggregate([
        {
            $match: { isDeleted: false, transactionType: "credit" }
        },
        {
            $lookup : {
                from : "customers",
                localField : "customerId",
                foreignField : "_id",
                as : "customer"
            }
        },
        {
            $project : {
                _id : 0,
                customerName : { $arrayElemAt: ["$customer.name", 0] },
                amount : 1,
                date: 1,
                transactionType : 1,
                description : 1,
                paymentMode : 1,
                createdAt : 1
            }
        },
        {
            $sort: { createdAt: -1 } 
        }
    ]);

    if(!allCustomerLedger?.length) {
        return res.status(200).json(ApiResponse.successRead([],"No payments found"));
    }
    
    const allPaymentsData = [...(allVendorLedger || []), ...(allCustomerLedger || [])]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json(ApiResponse.successRead(allPaymentsData, "Payments fetched successfully"));
});

export { getAllPayments }