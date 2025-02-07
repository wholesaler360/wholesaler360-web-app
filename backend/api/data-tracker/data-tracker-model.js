import mongoose, { Schema } from "mongoose";

const dataTrackerSchema = new Schema(
    {
        year: { 
            type: Number, 
            required: true 
        },
        tracker: {
            lastPurchaseNumber: {
                type: Number,
                default: 0,
            },
            lastInvoiceNumber: {
                type: Number,
                default: 0,
            },
        }
    },
    { timestamps: true }
);

export const DataTracker = mongoose.model("DataTracker", dataTrackerSchema);