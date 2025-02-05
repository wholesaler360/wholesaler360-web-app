import mongoose, { Schema } from "mongoose";

const dataTrackerSchema = new Schema(
    {
       
    },
    { timestamps: true }
);

export const DataTracker = mongoose.model("DataTracker", dataTrackerSchema);