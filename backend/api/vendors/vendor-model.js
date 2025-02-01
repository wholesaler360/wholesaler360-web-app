import mongoose, { Schema } from "mongoose";

const bankDetailsSchema = new Schema({
    bankName: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
    },
    accountNumber: {
        type: String,
        trim: true,
        required: true,
    },
    ifsc: {
        type: String,
        trim: true,
        required: true,
    },
    accountHolderName: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
    }
}, { _id: false });


const addressSchema = new Schema({
    addressLine1: {
        type: String,
        required: true,
        trim: true,
    },
    addressLine2: {
        type: String,
        trim: true,
    },
    city: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
    },
    state: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
    },
    pincode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
    }
}, { _id: false });


const vendorSchema = new Schema(
    {
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
        },
        mobileNo: {
            type: String,
            index: true,
            trim: true,
            required: true,
        },
        email: {
            type: String,
            index: true,
            trim: true,
            lowercase: true,
            required: true,
        },
        gstin: {
            type: String, 
            trim: true,
            uppercase: true,
        },
        address: {
            type: addressSchema,
            required: true
        },
        imageUrl: {
            type: String
        },
        bankDetails: {
            type: bankDetailsSchema,
            required: true
        },
        payableBalance: {
            type: Number,
            default: 0.0
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);




export const Vendor = mongoose.model("Vendor", vendorSchema);
