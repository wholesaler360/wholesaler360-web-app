import { Purchase } from "../purchase/purchase-model.js";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import { Ledger } from "../ledger/ledger-model.js";
import { stat } from "fs";
import { Invoice } from "../invoice/invoice-model.js";
import { CustomerLedger } from "../customer-ledger/customer-ledger-model.js";

const getPurchase = async function(){
    try {
        const totalPurchases = await Purchase.countDocuments({ isDeleted: false });
        const purchaseData = await Ledger.aggregate([
            {
                $match: { isDeleted: false }
            },
            {
                $group: {
                    _id: null,
                    totalPaid: { 
                        $sum: {
                            $cond: [ 
                                { $eq: ["$transactionType", "debit"] },
                                "$amount",
                                0
                            ]
                        }
                    },
                    total: { 
                        $sum: {
                            $cond: [ 
                                { $eq: ["$transactionType", "credit"] },
                                "$amount",
                                0
                            ]
                        }
                    }
                }
            },
            {
                $addFields: {
                    totalUnpaid: { $subtract: ["$total", "$totalPaid"] }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalPaid: 1,
                    totalUnpaid: 1,
                    total: 1
                }
            }
        ]);
        
        if (!purchaseData?.length) {
            return {   
                success : true,
                statusCode : 200,
                data : {
                    totalPurchases: 0, 
                    totalPaid: 0, 
                    totalUnpaid: 0, 
                    total: 0
                },
                message : "Data fetched successfully" 
            }
        }
        else{
            return {
                success : true,
                statusCode : 200,
                data : {
                    ...purchaseData[0],
                    totalPurchases
                },
                message : "Data fetched successfully" 
            }
        }
    } catch (error) {
        return {
            success : false,
            statusCode : 404,
            message : "Data not found error occured while fetching data",
            error : error
        }
    }
}

const getSales = async function(){
    try {
        const totalInvoices = await Invoice.countDocuments({ isDeleted: false });
        const salesData = await CustomerLedger.aggregate([
            {
                $match: { isDeleted: false }
            },
            {
                $group: {
                    _id: null,
                    totalPaid: { 
                        $sum: {
                            $cond: [ 
                                { $eq: ["$transactionType", "credit"] },
                                "$amount",
                                0
                            ]
                        }
                    },
                    total: { 
                        $sum: {
                            $cond: [ 
                                { $eq: ["$transactionType", "debit"] },
                                "$amount",
                                0
                            ]
                        }
                    }
                }
            },
            {
                $addFields: {
                    totalUnpaid: { $subtract: ["$total", "$totalPaid"] }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalPaid: 1,
                    totalUnpaid: 1,
                    total: 1
                }
            }
        ]);
    
        if (!salesData?.length) {
            return {   
                success : true,
                statusCode : 200,
                data : {
                    totalInvoices: 0, 
                    totalPaid: 0, 
                    totalUnpaid: 0, 
                    total: 0
                },
                message : "Data fetched successfully" 
            }
        }
        else{
            return {
                success : true,
                statusCode : 200,
                data : {
                    ...salesData[0],
                    totalInvoices
                },
                message : "Data fetched successfully" 
            }
        }
    } catch (error) {
        return {
            success : false,
            statusCode : 404,
            message : "Data not found",
            error : error
        }
    }
}


const getData = asyncHandler(async (req, res, next) => {
    
    const purchaseResponse = await getPurchase();
    if(purchaseResponse.success === false){
        console.log(purchaseResponse.error);
        return next(ApiError.dataNotFound(purchaseResponse.message));
    }
    
    const salesResponse = await getSales();
    if(salesResponse.success === false){
        console.log(salesResponse.error);
        return next(ApiError.dataNotFound(salesResponse.message));
    }

    const response = {
        purchaseData: purchaseResponse.data,
        salesData: salesResponse.data
    }

    return res.status(200).json(ApiResponse.successRead(response, "Data fetched successfully"));
});



export { getData };