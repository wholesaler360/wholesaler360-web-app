import mongoose from "mongoose";
import mongoosePaginate from "mongoose-aggregate-paginate-v2";

const customerSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    mobileNo:{
        type : String,
        required: true,
        trim: true,
        index: true,
        // unique: true,
    },
    email:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        // unique: true,
    },
    gstin : {
        type: String,
        trim: true,
        uppercase: true,
        default: null,
    },
    avatar : {
        type: String,
        default: null
    },
    billingAddress: {
        addressLine1 : {
            type: String,
            required: true,
            trim: true,
        },
        addressLine2 : {
            type: String,
            trim: true,
        },
        city : {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        state : {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        pincode : {
            type: String,
            required: true,
        },
    },
    shippingAddress: {
        addressLine1 : {
            type: String,
            required: true,
            trim: true,
        },
        addressLine2 : {
            type: String,
            trim: true,
        },
        city : {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        state : {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        pincode : {
            type: String,
            required: true,
        },
    },
    bankDetails: {
        accountName : {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        ifscCode : {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },
        accountNo : {
            type: String,
            required: true,
            trim: true,
        },
        bankName : {
            type: String,
            trim: true,
            lowercase: true,
        },
    },
    receiveableBalance:{
        type: Number,
        default: 0,
    },
    isDeleted:{
        type: Boolean,
        default: false,
    },
    createdBy : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
},
{
    timestamps: true
}
);

customerSchema.plugin(mongoosePaginate);


export const Customer = mongoose.model("Customer", customerSchema);