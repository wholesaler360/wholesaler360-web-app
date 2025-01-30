import { Customer } from "./customer-model.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { uploadFile , deleteFromCloudinary , deleteFromLocalPath} from "../../utils/cloudinary-utils.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import {Invoice} from "../invoice/invoice-model.js"
const createCustomer = asyncHandler(async(req,res,next) => {
    console.log("-----------------Create Customer-----------------");  
    try {
        let {name , mobileNo , email} = req.body;
        let customerImageLocalPath = req.files?.avatar?.[0]?.path;

        if(!name || !mobileNo || !email){
            return next(ApiError.validationFailed("Name , Mobile No and Email are required"));
        }
        
        const gstin = req.body?.gstin.trim().toUpperCase() || null;
            
        const condition = [
            {mobileNo, isDeleted: false},
            {email, isDeleted: false}
        ]
        if(gstin){
            condition.push({gstin , isDeleted : false});
        }

        const existingCustomer = await Customer.findOne({ $or : condition });

        if(existingCustomer){
            return next(ApiError.valueAlreadyExists("Customer already exists either with same mobile no or email or gstin"));
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
            
        let avatar = await uploadFile(customerImageLocalPath);;
            if(customerImageLocalPath){
                if(!avatar){
                    return next(ApiError.dataNotInserted("Error uploading image"));
                }   
            }
                
        const customer = new Customer({
                name,
                mobileNo,
                email,
                gstin,
                avatar,
                billingAddress,
                shippingAddress,
                bankDetails,
                receiveableBalance,
                createdBy : req.fetchedUser._id
            });

        try {
            const savedCustomer = await customer.save();
            console.log(savedCustomer);
            res.status(201).json(ApiResponse.successCreated(savedCustomer,"Customer created successfully"));
        } catch (error) {
            await deleteFromCloudinary(avatar);
            console.log(error);
            return next(ApiError.dataNotInserted(error.message,error));
        }
        console.log("-------------Customer Created Successfully-----------------");
    } catch (error) {
        console.log(error);
        return next(ApiError.dataNotInserted(error.message,error));
    } finally{
        if(req.files?.avatar?.[0]?.path){
            deleteFromLocalPath(req.files?.avatar?.[0]?.path);
        }
    }
})


const updateCustomer = asyncHandler(async (req, res, next) => {
  console.log("-----------------Update Customer-----------------");
  let name = req.body?.name?.trim().toLowerCase();
  let mobileNo = req.body?.mobileNo;
  let newMobileNo = req.body?.newMobileNo || mobileNo;
  let email = req.body?.email;
  let gstin = req.body?.gstin.trim().toUpperCase() || null;
  console.log("Old MobileNo. ", mobileNo, "   New Mobile No. ", newMobileNo);

  if (!name||!mobileNo || !email) {
    return next(ApiError.validationFailed("Name ,Mobile No and email are required"));
  }

  const customer = await Customer.findOne({ mobileNo, isDeleted: false });
  if (!customer) {
    return next(ApiError.dataNotFound("Customer not found or customer is deleted"));
  }

  // Check for existing customers with the new mobile number, email, or gstin
  const conditions = [];
  if (mobileNo !== newMobileNo) {
    conditions.push({ mobileNo: newMobileNo, isDeleted: false });
  }
  if (customer.email !== email) {
    conditions.push({ email, isDeleted: false });
  }
  if (customer.gstin !== gstin && gstin) {
    conditions.push({ gstin, isDeleted: false });
  }

  if (conditions.length > 0) {
    const existingCustomer = await Customer.findOne({ $or: conditions });
    if (existingCustomer) {
      return next(ApiError.valueAlreadyExists("Customer already exists with the same mobile number, email, or GSTIN"));
    }
  }

  const billingAddress = req.body.billingAddress;
  if (!billingAddress.name || !billingAddress.address || !billingAddress.city || !billingAddress.state || !billingAddress.pincode) {
    return next(ApiError.validationFailed("Billing Address is required"));
  }
  const shippingAddress = req.body.shippingAddress;
  if (!shippingAddress.name || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
    return next(ApiError.validationFailed("Shipping Address is required"));
  }
  const bankDetails = req.body.bankDetails;
  if (!bankDetails.accountName || !bankDetails.ifscCode || !bankDetails.accountNo || !bankDetails.bankName) {
    return next(ApiError.validationFailed("Bank Details are required"));
  }

  // Update customer fields
  try {
    customer.name = name;
    customer.mobileNo = newMobileNo;
    customer.email = email;
    customer.gstin = gstin;
    customer.billingAddress = billingAddress;
    customer.shippingAddress = shippingAddress;
    customer.bankDetails = bankDetails;
  
    await customer.save();
    const {__v , createdAt , updatedAt , isDeleted , ...rest} = customer.toObject();
        const orderedCustomer = {
            name: rest.name,
            mobileNo: rest.mobileNo,
            email: rest.email,
            gstin: rest.gstin,
            avatar: rest.avatar,
            billingAddress: rest.billingAddress,
            shippingAddress: rest.shippingAddress,
            bankDetails: rest.bankDetails,
            receiveableBalance: rest.receiveableBalance,
            createdBy: rest.createdBy
        };
    console.log(orderedCustomer);
  
    res.status(200).json(ApiResponse.successUpdated(orderedCustomer, "Customer updated successfully"));
  } catch (error) {
    console.log(error);
    return next(ApiError.dataNotUpdated(error.message, error));
}
});

const updateCustomerAvatar = asyncHandler(async(req,res,next)=>{
    console.log("-----------------Update Customer Avatar-----------------");
    let {mobileNo} = req.body;
    mobileNo = mobileNo.trim();
    const customerImageLocalPath = req.files?.avatar?.[0]?.path;
   try {
     if(!mobileNo){
         return next(ApiError.validationFailed("Mobile No is required"));
     }
     if(!customerImageLocalPath){
         return next(ApiError.validationFailed("Avatar is required"));
     }
     const customer = await Customer.findOne({mobileNo , isDeleted : false});
 
     if(!customer){
         return next(ApiError.dataNotFound("Customer not found or customer is deleted"));
     }
     const oldAvatar = customer.avatar;
    const avatar = await uploadFile(customerImageLocalPath);
    if(!avatar){
        return next(ApiError.dataNotUpdated("Error uploading image"));
    }
    customer.avatar = avatar;
    await customer.save();
    await deleteFromCloudinary(oldAvatar);
    console.log(customer);

    const {__v , createdAt , updatedAt , isDeleted , ...rest} = customer.toObject();
        const orderedCustomer = {
            name: rest.name,
            mobileNo: rest.mobileNo,
            email: rest.email,
            gstin: rest.gstin,
            avatar: rest.avatar,
            billingAddress: rest.billingAddress,
            shippingAddress: rest.shippingAddress,
            bankDetails: rest.bankDetails,
            receiveableBalance: rest.receiveableBalance,
            createdBy: rest.createdBy
        };
    res.status(200).json(ApiResponse.successUpdated(orderedCustomer,"Customer Avatar updated successfully"));
    console.log("-------------Customer Avatar Updated Successfully-----------------");
   } catch (error) {
        console.log(error);
        return next(ApiError.dataNotUpdated(error.message,error));
   }finally{
         if(req.files?.avatar?.[0]?.path){
              deleteFromLocalPath(req.files?.avatar?.[0]?.path);
         }
   }



})
const getTotalNoOfInvoice = async(customerId) => {
    const totalNoOfInvoice = await Invoice.countDocuments({customerId});
}

const deleteCustomer = asyncHandler(async(req,res,next) => {
    console.log("-----------------Delete Customer-----------------");
    const {mobileNo} = req.body;
    if(!mobileNo){
        return next(ApiError.validationFailed("Mobile No is required"));
    }

    try {
        const customer = await Customer.findOne({mobileNo , isDeleted : false});
        if(!customer){
            return next(ApiError.dataNotFound("Customer not found or customer is deleted"));
        }

        if(customer.receiveableBalance > 0){
            return next(ApiError.validationFailed("Customer has some debt payment left balance"));
        }
        const customerAvatar = customer.avatar;
        const deletedCustomer = customer;
        customer.isDeleted = true;
        customer.avatar = null;
        await customer.save()
        await deleteFromCloudinary(customerAvatar);
        console.log(deletedCustomer);
        res.status(204).json(ApiResponse.successDeleted(deletedCustomer,"Customer deleted successfully"));
        console.log("-------------Customer Deleted Successfully-----------------");
    }
    catch(error){
        console.log(error);
        return next(ApiError.dataNotDeleted(error.message,error));
    }
})

const fetchCustomer = asyncHandler(async(req,res,next) => {
    console.log("-----------------Fetch Customer-----------------");
    const {mobileNo } = req.body;
    if(!mobileNo ){
        return next(ApiError.validationFailed("Mobile No or Email is required"));
    }
    try {
        const customer = await Customer.findOne({mobileNo , isDeleted : false});
        if(!customer){
            return next(ApiError.dataNotFound("Customer not found or customer is deleted"));
        }
        
        const {__v , createdAt , updatedAt , isDeleted , ...rest} = customer.toObject();
        const orderedCustomer = {
            name: rest.name,
            mobileNo: rest.mobileNo,
            email: rest.email,
            gstin: rest.gstin,
            avatar: rest.avatar,
            billingAddress: rest.billingAddress,
            shippingAddress: rest.shippingAddress,
            bankDetails: rest.bankDetails,
            receiveableBalance: rest.receiveableBalance,
            createdBy: rest.createdBy
        };
        res.status(200).json(ApiResponse.successRead(orderedCustomer, "Customer fetched successfully"));    
        console.log("-------------Customer Fetched Successfully-----------------");
    } catch (error) {
        console.log(error);
        return next(ApiError.dataNotFound(error.message,error));
    }

})
const fetchAllCustomer = asyncHandler(async(req,res,next) => {
    const customer = await Customer.aggregate([
        {
            $match : {isDeleted : false}
        },
        {
            $lookup : {
                from : "invoices",
                localField : "_id",
                foreignField : "customerId",
                as : "invoice"
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "createdBy",
                foreignField : "_id",
                as : "user"
            }
        },
        {
            $addFields : {
                customerInfo :  {
                    name : "$name",
                    mobileNo : "$mobileNo",
                    email : "$email",
                    avatar : "$avatar",
                    totalNoOFInvoice : { $size : "$invoice"},
                    receiveableBalance : "$receiveableBalance",
                    createdBy : {
                        name : { $arrayElemAt: ["$user.name", 0] },
                        mobileNo : { $arrayElemAt: ["$user.mobileNo", 0] },
                    }
                }
            }
        },
        {
            $group : {
                _id : null,
                customers : {
                    $push : "$customerInfo"
                }
            }
        },
        {
            $project : {
                _id : 0,
                customers : 1
            }
        }
    ]);
    if(customer.length === 0){
        return next(ApiError.dataNotFound("No customer found"));
    }
    res.status(200).json(ApiResponse.successRead(customer[0].customers,"Customers fetched successfully"));
})

export { createCustomer , updateCustomer , updateCustomerAvatar , deleteCustomer , fetchCustomer , fetchAllCustomer };