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
        lowercase: true,
    },
    billingAddress: {
        name : {
            type: String,
            required: true,
            trim: true,
        },
        address : {
            type: String,
            required: true,
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
            type: Number,
            required: true,
        },
    },
    shippingAddress: {
        name : {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        address : {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
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
            type: Number,
            required: true,
            trim: true,
            lowercase: true,
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
            lowercase: true,
        },
        accountNo : {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        bankName : {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
    },
    receiveableBalance:{
        type: Number,
        default: 0,
    },
    isCustomerDeleted:{
        type: Boolean,
        default: false,
    }
}
);

customerSchema.plugin(mongoosePaginate);


export const Customer = mongoose.model("Customer", customerSchema);