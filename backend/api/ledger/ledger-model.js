import mongoose, { Schema } from "mongoose";

const ledgerSchema = new Schema(
    {
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: "Vendor",
            required: true
        },
        date: {
            type: Date,
            required: true,
        },
        amount: {
            type: Number,
            required: true
        },
        transactionType: {
            type: String, 
            enum: ['credit', 'debit'], 
            required: true 
        },
        paymentMode: {
            type: String,
            enum: ['cash', 'cheque', 'upi', 'online', 'N/A'],
        },
        payableBalance: {
            type: Number,
            required: true
        },
        description: {
            type: String
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);


export const Ledger = mongoose.model("Ledger", ledgerSchema);
