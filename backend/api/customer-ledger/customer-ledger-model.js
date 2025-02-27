import mongoose, { Schema } from "mongoose";

const customerLedgerSchema = new Schema(
    {
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
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
        receivableBalance: {
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


export const CustomerLedger = mongoose.model("CustomerLedger", customerLedgerSchema);
