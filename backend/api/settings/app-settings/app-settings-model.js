import mongoose, { Schema } from "mongoose";


const appEmailSettingsSchema = new Schema(
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
            type: Number,
            trim: true,
            required: true,
        }
    },
    { timestamps: true }
);
const appInvoiceTemplateSchema = new Schema(
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
            type: Number,
            trim: true,
            required: true,
        }
    },
    { timestamps: true }
);


export const AppEmailSettings = mongoose.model("CompanyEmailSettings", appEmailSettingsSchema);
