import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { Vendor } from "./vendor-model.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import { uploadFile, deleteFromLocalPath } from "../../utils/cloudinary-utils.js";

 
const createVendor = asyncHandler(async(req, res, next)=>{
    const {
        name, mobileNo, email, gstin, balance, 
        addressLine1, addressLine2, city, state, postalCode, 
        country, branchName, ifsc, bankName, accountNumber 
    } = req.body;

    // Check if all the required fields are present or not 
    if (
        [name, mobileNo, email].some((field) => !field?.trim())  
        || !addressLine1   
        || !city           
        || !state          
        || !postalCode     
        || !country        
        || !bankName   
        || !ifsc       
        || !accountNumber
    ) {
        return next(ApiError.validationFailed("Please provide all required fields"));
    }

    const address = {
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country
    };

    const bankDetails = {
        branchName,
        ifsc,
        bankName,
        accountNumber
    };

    const existingVendor = await Vendor.findOne({ 
        $or: [{ email }, { mobileNo }],
    });

    if(existingVendor) {
        deleteFromLocalPath(req.files?.avatar?.[0]?.path);
        return next(ApiError.valueAlreadyExists("Vendor Already Exists"))
    }

    let avatar;
    // Handle avatar upload
    if(req.files?.avatar?.[0]?.path) {
        avatar = await uploadFile(req.files.avatar[0].path);
    }

    try {
        const vendorCreated = await Vendor.create({
            createdBy: req.fetchedUser._id,
            name,
            mobileNo,
            email,
            gstin,
            address,
            bankDetails,
            imageUrl: avatar,
            balance: balance || 0.0
        });
        
        return res.status(201).json(ApiResponse.successCreated(vendorCreated, "Vendor created successfully"));
    } catch (error) {
        deleteFromLocalPath(req.files?.avatar?.[0]?.path);
        return next(ApiError.dataNotInserted("Vendor not created", error));
    }
});


const fetchAllVendors = asyncHandler(async(req, res, next) => {
    const vendors = await Vendor.find({ 
        isDeleted: false,
    }, { __v: 0, deletedAt: 0, updatedAt: 0 });
    
    if (!vendors?.length) {
        return next(ApiError.dataNotFound("No vendors found"));
    }

    return res.status(200).json(
        ApiResponse.successRead(vendors, "Vendors fetched successfully")
    );
});


const fetchVendorById = asyncHandler(async(req, res, next) => {
    const { vendorId } = req.params;

    if (!vendorId?.trim()) {
        return next(ApiError.validationFailed("Vendor ID is required"));
    }

    const vendor = await Vendor.findOne({ 
        _id: vendorId,
        isVendorDeleted: false 
    });

    if (!vendor) {
        return next(ApiError.notFound("Vendor not found"));
    }
    
    return res.status(200).json(
        ApiResponse.success(vendor, "Vendor fetched successfully")
    );
});

export { createVendor, fetchAllVendors, fetchVendorById };
