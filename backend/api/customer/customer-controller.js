import { Customer } from "./customer-model.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { uploadFile } from "../../utils/cloudinary-utils.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";

const createCustomer = asyncHandler(async(req,res,next) => {
    let {name , mobileNo , email} = req.body;

    if(!name || !mobileNo || !email){
        return next(ApiError.validationFailed("Name , Mobile No and Email are required"));
    }

    

    const billingAddress = req.body.billingAddress;
    if(!billingAddress.name || !billingAddress.address || !billingAddress.city || !billingAddress.state || !billingAddress.pincode){
        return next(ApiError.validationFailed("Billing Address is required"));
    }

    const shippingAddress = req.body.shippingAddress;
    if(!shippingAddress.name || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode){
        return next(ApiError.validationFailed("Shipping Address is required"));
    }

    const bankDetails = req.body.bankDetails;
    if(!bankDetails.accountName || !bankDetails.ifscCode || !bankDetails.accountNo || !bankDetails.bankName){
        return next(ApiError.validationFailed("Bank Details are required"));
    }

    const receiveableBalance = req.body.receiveableBalance;
    const gstin = req.body.gstin;

    try {
        const customer = new Customer({
            name,
            mobileNo,
            email,
            gstin,
            billingAddress,
            shippingAddress,
            bankDetails,
            receiveableBalance
        });

        const savedCustomer = await customer.save();

        res.status(201).json(ApiResponse.successCreated("Customer created successfully",savedCustomer));
    } catch (error) {
        console.log(error);
        return next(ApiError.dataNotInserted(error.message,error));
    }
})

const updateCustomer = asyncHandler(async(req,res,next) => {

})

const deleteCustomer = asyncHandler(async(req,res,next) => {

})

const fetchCustomer = asyncHandler(async(req,res,next) => {

})

const fetchAllCustomer = asyncHandler(async(req,res,next) => {

})

export { createCustomer , updateCustomer , deleteCustomer , fetchCustomer , fetchAllCustomer };