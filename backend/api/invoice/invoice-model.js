import mongoose, { Schema } from "mongoose";

const invoiceSchema = new Schema(
    {
        invoiceNo: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            index: true,
            unique: true,
        },
        invoiceDate: {
            type: Date,
            required: true,
        },
        invoiceDueDate:{
            type: Date
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        products: [{
            _id: false,
            id: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            unitPrice: {
              type: Number,
              required: true,
            },
            discountAmount:{
                type: Number,
                required: true,
            },
            taxAmount: {
                type: Number,
                required: true,
            },
            amount: {
              type: Number,
              required: true,
            }
        }],
        totalDiscount : {
            type: Number,
            required: true,
        },
        totalTax: {
            type: Number,
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        transactionType: {
            type: String,
            enum: ["debit", "credit"],
            required: true,
        },
        paymentMode: {
            type: String,
            enum: ['cash', 'cheque', 'upi', 'online', 'N/A'],
        },
        initialPayment: {
            type: Number,
            required: true,
            default: 0,
        },
        description: {
            type: String,
        },
        bankDetails:{
            type : Schema.Types.ObjectId,
            ref : "CompanyBankDetails",
            required : true, 
        },
        signature:{
            type : Schema.Types.ObjectId,
            ref : "CompanySignatures",
            required : true,
        },
        quotationId: {
            type: Schema.Types.ObjectId,
            ref: "Quotation",
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        isSaleReturn: {
            type: Boolean,
            default: false,
        },
        isRoundedOff: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },  
    { timestamps: true }
);


export const Invoice = mongoose.model("Invoice", invoiceSchema);