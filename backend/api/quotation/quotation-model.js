import mongoose, { Schema } from "mongoose";

const quotationSchema = new Schema(
    {
        quotationNo: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            index: true,
            unique: true,
        },
        quotationDate: {
            type: Date,
            required: true,
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
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
            }
        }],
        totalDiscount : {
            type: Number,
        },
        totalTax: {
            type: Number,
        },
        totalAmount: {
            type: Number,
        },
        description: {
            type: String,
        },
        quotationStatus : {
            type: String,
            enum: ["sent", "accepted", "rejected"],
            default: "sent",
        },
        signature: {
            type: Schema.Types.ObjectId,
            ref: "CompanySignatures",
            required : true
        }, 
        isDeleted: {
            type: Boolean,
            default: false,
        },
        isRoundedOff: {
            type: Boolean,
            default: false,
        },
        isConvertedToInvoice: {
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


export const Quotation = mongoose.model("Quotation", quotationSchema);