import mongoose from "mongoose";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import { Invoice } from "./invoice-model.js";
import { Product } from "../product/product-model.js";
import { CompanyBankDetails, CompanySignatures } from "../settings/company-settings/company-settings-model.js";
import { stockDeductionInventoryService } from "../inventory/inventory-controller.js";
import { createCustomerLedgerService } from "../customer-ledger/customer-ledger-controller.js";
import { incrementTrackerService } from "../data-tracker/data-tracker-controller.js"; 


const createInvoice = asyncHandler(async (req, res, next) => {
    const { 
        invoiceDate, customerId, invoiceDueDate, transactionType, 
        products, paymentMode, initialPayment, bankDetails, 
        signature, isRoundedOff, description 
    } = req.body;
    
    // Check if all the required fields are present or not
    if (
        [
            bankDetails,
            signature,
        ].some((field) =>
            // Apply trim only if field is a string
            typeof field === "string" ? !field.trim() : !field
        )
        ||
        typeof isRoundedOff !== "boolean"
    ) {
        return next(
            ApiError.validationFailed("Please provide all the required fields")
        );
    }

    const invoiceDateObj = new Date(invoiceDate);
    const invoiceDueDateObj = new Date(invoiceDueDate);

    if (invoiceDueDateObj < invoiceDateObj) {
        return next(ApiError.validationFailed("Due date cannot be before invoice date"));
    }

    if (transactionType === "credit" && initialPayment <= 0 ) {
        return next(ApiError.validationFailed("Initial payment should be greater than 0"));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate bank details and signature 

        const validBankDetails = await CompanyBankDetails.findById(bankDetails).session(session);
        if (!validBankDetails) {
            await session.abortTransaction();
            session.endSession();
            return next(ApiError.notFound("Invalid bank details"));
        }

        const validSignature = await CompanySignatures.findById(signature).session(session);
        if (!validSignature) {
            await session.abortTransaction();
            session.endSession();
            return next(ApiError.notFound("Invalid signature"));
        }
    
        
        // Check if products are provided or not

        if (!products || products.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return next(ApiError.validationFailed("Please provide products"));
        }

        // Validate products

        const productIds = [];
        for (const element of products) {
            if (
                element.id &&
                element.quantity > 0 &&
                element.unitPrice > 0 &&
                ( element.taxRate >= 0 && element.taxRate <= 100 )
            ) {
                productIds.push(element.id);
            } else {
                await session.abortTransaction();
                session.endSession();
                return next(ApiError.validationFailed("Invalid product data"));
            }
        }

        const fetchedProducts = await Product.find(
            { _id: { $in: productIds }, isProductDeleted: false },
            { _id : 1, discountType: 1, discountValue: 1 }
        ).session(session);

        if (fetchedProducts.length !== products.length ) {
            await session.abortTransaction();
            session.endSession();
            return next(ApiError.validationFailed("Invalid product data"));
        }

        // Calculate tax and amount for each product and total tax, total amount and total discount

        let totalDiscount = 0, totalTax = 0, totalAmount = 0;
        products.forEach((product) => {

            const fetchedProduct = fetchedProducts.find((p) => p._id.toString() === product.id);
            const basePrice = product.unitPrice * product.quantity;
            
            product.discountAmount = fetchedProduct.discountType === "fixed" ?
                fetchedProduct.discountValue:
                parseFloat((basePrice * fetchedProduct.discountValue / 100).toFixed(2));

            product.taxAmount = parseFloat(((basePrice - product.discountAmount) * product.taxRate / 100).toFixed(2));
            product.amount = parseFloat((basePrice + product.taxAmount - product.discountAmount).toFixed(2));
            
            totalDiscount += product.discountAmount;
            totalTax += product.taxAmount;
            totalAmount += product.amount;

        });

        if (initialPayment > totalAmount) {
            await session.abortTransaction();
            session.endSession();
            return next(ApiError.validationFailed("Initial payment should not be more than total amount"));
        }
        
        if (isRoundedOff){
            totalAmount = Math.round(totalAmount);
        }


        // Generate a unique invoice number

        const invoiceTracker = await incrementTrackerService("lastInvoiceNumber", invoiceDateObj, session);
        
        if (!invoiceTracker.success) {
            await session.abortTransaction();
            session.endSession();
            return next(ApiError[invoiceTracker.errorType](invoiceTracker.message));
        }

        const invoiceNo = `INV-${invoiceDateObj.getFullYear()}/${ invoiceTracker.data.lastInvoiceNumber }`;
        console.log('invoiceNo: ', invoiceNo);  

        // Create the purchase

        const invoice = new Invoice({
            invoiceNo,
            invoiceDate: invoiceDateObj,
            invoiceDueDate: invoiceDueDateObj,
            customerId,
            products,
            totalDiscount,
            totalTax,
            totalAmount,
            transactionType,
            paymentMode: transactionType === "credit" ? paymentMode : "N/A",
            initialPayment : transactionType === "credit" ? initialPayment : 0,
            description,
            bankDetails,
            signature,
            isRoundedOff, 
            createdBy: req.fetchedUser._id,
        });
        
        const invoiceCreated = await invoice.save({ session });
        
        if (!invoiceCreated) {
            await session.abortTransaction();
            session.endSession();
            return next(ApiError.dataNotInserted("Failed to create invoice"));
        }

        // Add inventory for the products

        const InventoryData = { products };
        const inventoryResult = await stockDeductionInventoryService(InventoryData, session);
                                                                                                                                                               
        if (!(inventoryResult.success)) {
            await session.abortTransaction();
            session.endSession();
            return next(ApiError[inventoryResult.errorType](inventoryResult.message));
        }

        // Create the credit entry in the ledger

        const ledgerDataDebit = { customerId, amount: invoiceCreated.totalAmount, transactionType: "debit", date: invoiceDateObj, description };
        const ledgerResultDebit = await createCustomerLedgerService(ledgerDataDebit, req.fetchedUser, session);
        
        if (!(ledgerResultDebit.success)) {  
            await session.abortTransaction();
            session.endSession();
            return next(ApiError[ledgerResultDebit.errorType](ledgerResultDebit.message));
        }

        // create credit entry in the ledger only if transaction type is credit

        if(transactionType === "credit") {
            const ledgerDataCredit = { customerId, amount: initialPayment, transactionType, paymentMode, date: invoiceDateObj, description };
            const ledgerResultCredit = await createCustomerLedgerService(ledgerDataCredit, req.fetchedUser, session);
            
            if (!(ledgerResultCredit.success)) {
                await session.abortTransaction();
                session.endSession();
                return next(ApiError[ledgerResultCredit.errorType](ledgerResultCredit.message));
            }
        }

        // Filter out unwanted fields

        const{isDeleted, __v, ...remaining} = invoiceCreated.toObject();

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json(ApiResponse.successCreated(remaining, "Invoice created successfully"));
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.log(`Error creating invoice: ${error}`);
        if(error.code === 11000) {
            return next(ApiError.dataNotInserted("Duplicate invoice number"));
        }
        return next(ApiError.dataNotInserted("Failed to create invoice"));
    }

});


const fetchAll = asyncHandler(async (req, res, next) => {
    try {
        const invoices = await Invoice.aggregate([
            {
                $match: {
                    isSaleReturn: false,
                }
            },
            {
                $lookup: {
                    from: "customers",
                    localField: "customerId",
                    foreignField: "_id",
                    as: "customer",
                }
            },
            {
                $project: {
                    _id: 1,
                    invoiceNo: 1,
                    invoiceDate: 1,
                    initialPayment : 1,
                    totalAmount: 1,
                    transactionType: 1,
                    paymentMode: 1,
                    customerName: { $arrayElemAt: ["$customer.name", 0] },

                }
            }
        ])
        if(!invoices?.length) {
            return res.status(200).json(ApiResponse.successRead([]));
        }
        return res.status(200).json(ApiResponse.successRead(invoices));

    } catch (error) {
        console.log(`Error fetching invoices: ${error}`);
        return next(ApiError.dataNotFound("Failed to fetch invoices"));
    }
});

export { createInvoice, fetchAll };