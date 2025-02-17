import mongoose, { Schema } from "mongoose";


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


const companyDetailsSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
        },
        mobileNo: {
            type: String,
            required: true,
            trim: true,
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
        termsAndConditions: {
            type: String,
            trim: true
        },
        logoUrl: {
            type: String
        },
        faviconUrl: {
            type: String
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);


const companyBankDetailsSchema = new Schema(
    {
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
        },
        upiId: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
        },
    },
    { timestamps: true }
);


const companySignaturesSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
        },
        signatureUrl: {
            type: String,
            required: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);


const companyEmailSettingsSchema = new Schema(
    {
        email: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
        },
        credential: {
            type: String,
            trim: true,
            required: true,
        },
        smtpHost: {
            type: String,
            trim: true,
            required: true,
        },
        smtpPort: {
            type: String,
            trim: true,
            required: true,
        }
    },
    { timestamps: true }
);


export const CompanyDetails = mongoose.model("CompanyDetails", companyDetailsSchema);
export const CompanyBankDetails = mongoose.model("CompanyBankDetails", companyBankDetailsSchema);
export const CompanySignatures = mongoose.model("CompanySignatures", companySignaturesSchema);
export const CompanyEmailSettings = mongoose.model("CompanyEmailSettings", companyEmailSettingsSchema);