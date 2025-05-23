import mongoose, { Schema } from "mongoose";

const purchaseSchema = new Schema(
    {
        purchaseNo: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            index: true,
            unique: true,
        },
        purchaseDate: {
            type: Date,
            required: true,
        },
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },
        products: [{
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
            taxRate: {
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
        isDeleted: {
            type: Boolean,
            default: false,
        },
        isPurchaseReturn: {
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


export const Purchase = mongoose.model("Purchase", purchaseSchema);