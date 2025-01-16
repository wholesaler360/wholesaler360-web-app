import mongoose, { Schema } from "mongoose";

const bankDetailsSchema = new Schema({
    bankName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    ifsc: {
        type: String,
        required: true
    },
    branchName: {
        type: String
    }
}, { _id: false });


const addressSchema = new Schema({
    addressLine1: {
        type: String,
        required: true
    },
    addressLine2: {
        type: String
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
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
            required: true,
            trim: true,
            index: true
        },
        mobileNo: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        gstin: {
            type: String
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
        balance: {
            type: Number,
            default: 0.0
        },
        isVendorDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export const Vendor = mongoose.model("Vendor", vendorSchema);
