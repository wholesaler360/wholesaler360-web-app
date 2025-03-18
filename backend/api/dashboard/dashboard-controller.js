import { Purchase } from "../purchase/purchase-model.js";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import { Ledger } from "../ledger/ledger-model.js";
import { stat } from "fs";
import { Invoice } from "../invoice/invoice-model.js";
import { CustomerLedger } from "../customer-ledger/customer-ledger-model.js";
import { Inventory } from "../inventory/inventory-model.js";
import { DataTracker } from "../data-tracker/data-tracker-model.js";

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

const getAlertProduct = asyncHandler(async (req, res, next) => {
    const alertProducts = await Inventory.aggregate([
        {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product"
            }
        },
        {
            $addFields: {

                productName : { $arrayElemAt: ["$product.name", 0] },
                alert: {
                        $lte: ["$totalQuantity", { $arrayElemAt: ["$product.alertQuantity", 0] }]
                },
                quantity : "$totalQuantity"
                
            }
        },
        {
            $project: {
                _id: 0,
                productName: 1,
                alert: 1,
                quantity: 1
            }
        }
    ]);

    if(!alertProducts?.length) {
        return res.status(200).json(ApiResponse.successRead([],"No alert products found"));
    }

    return res.status(200).json(ApiResponse.successRead(alertProducts, "Alert products fetched successfully"));
});

const getBestSellingProducts = asyncHandler(async (req, res, next) => {
    const bestSellingProducts = await Invoice.aggregate([
        {
            $unwind: "$products"
        },
        {
            $group: {
                _id: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" },
                    productId: "$products.id"
                },
                totalQuantitySold: { $sum: "$products.quantity" }
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "_id.productId",
                foreignField: "_id",
                as: "product"
            }
        },
        {
            $lookup: {
                from: "inventories",
                localField: "_id.productId",
                foreignField: "productId",
                as: "inventory"
            }
        },
        {
            $addFields: {
                productName: { $arrayElemAt: ["$product.name", 0] },
                skuCode: { $arrayElemAt: ["$product.skuCode", 0] },
                currentStock: { $arrayElemAt: ["$inventory.totalQuantity", 0] }
            }
        },
        {
            $group: {
                _id: { 
                    month: "$_id.month", 
                    year: "$_id.year" 
                },
                products: {
                    $push: {
                        productId: "$_id.productId",
                        productName: "$productName",
                        skuCode: "$skuCode",
                        totalQuantitySold: "$totalQuantitySold",
                        currentStock: "$currentStock"
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                year: "$_id.year",
                month: "$_id.month",
                products: {
                    $slice: [ 
                        { 
                            $sortArray: { 
                                input: "$products", 
                                sortBy: { totalQuantitySold: -1 } 
                            } 
                        }, 
                        2 
                    ]
                }
            }
        },
        {
            $sort: { month: 1 }
        },
        {
            $group: {
                _id: "$year",
                months: {
                    $push: {
                        month: "$month",
                        products: "$products"
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                year: "$_id",
                months: 1
            }
        },
        {
            $sort: { year: -1 }
        }
    ]);

    if (!bestSellingProducts?.length) {
        return res.status(200).json(ApiResponse.successRead([], "No best selling products found"));
    }

    return res.status(200).json(ApiResponse.successRead(bestSellingProducts, "Best selling products fetched successfully"));
});

const getFinancialMetrics = asyncHandler(async (req, res, next) => {
    try {
        const [salesMetrics, stockValue, purchaseMetrics] = await Promise.all([
            // Sales metrics aggregation
            Invoice.aggregate([
                {
                    $match: { 
                        isDeleted: false,
                        isSaleReturn: false
                    }
                },
                {
                    $group: {
                        _id: null,
                        grossRevenue: { $sum: "$totalAmount" },
                        netRevenue: { $sum: { $subtract: ["$totalAmount", "$totalTax"] } },
                        totalTax: { $sum: "$totalTax" },
                        totalDiscount: { $sum: "$totalDiscount" }
                    }
                }
            ]),
            // Stock value aggregation
            Inventory.aggregate([
                {
                    $unwind: "$batches"
                },
                {
                    $lookup: {
                        from: "batches",
                        localField: "batches.batch",
                        foreignField: "_id",
                        as: "batchDetails"
                    }
                },
                {
                    $unwind: "$batchDetails"
                },
                {
                    $match: {
                        "batchDetails.isDeleted": false
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalStockValue: {
                            $sum: {
                                $multiply: [
                                    "$batchDetails.currentQuantity",
                                    "$batchDetails.purchasePrice"
                                ]
                            }
                        },
                        totalQuantity: { $sum: "$batchDetails.currentQuantity" }
                    }
                },
            ]),

            Purchase.aggregate([
                {
                    $match: { 
                        isDeleted: false,
                        isPurchaseReturn: false
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalPurchase: { $sum: "$totalAmount" },
                        totalPurchaseWithoutTax: { $sum: { $subtract: ["$totalAmount", "$totalTax"] } },
                        totalTax: { $sum: "$totalTax" },
                    }
                }
            ]),
        ]);

        if (!salesMetrics?.length && !stockValue?.length && !purchaseMetrics?.length) {
            return res.status(200).json(
                ApiResponse.successRead([], "No financial metrics found")
            );
        }
        const response = {
            grossRevenue : salesMetrics[0].grossRevenue,
            netRevenue : salesMetrics[0].netRevenue,
            totalTaxReceived : salesMetrics[0].totalTax,
            totalDiscount : salesMetrics[0].totalDiscount,
            totalStockValue : stockValue[0].totalStockValue,
            totalCOGS : purchaseMetrics[0].totalPurchaseWithoutTax,
            totalTaxPaid : purchaseMetrics[0].totalTax,
            totalPurchase : purchaseMetrics[0].totalPurchase,
            grossProfit : (salesMetrics[0].netRevenue - purchaseMetrics[0].totalPurchaseWithoutTax + stockValue[0].totalStockValue).toFixed(2),
        }
        return res.status(200).json(
            ApiResponse.successRead(response, "Financial metrics fetched successfully")
        );

    } catch (error) {
        console.error("Error fetching financial metrics:", error);
        return next(ApiError.dataNotFound("Failed to fetch financial metrics"));
    }
});

export { getData, getAlertProduct, getBestSellingProducts, getFinancialMetrics };
