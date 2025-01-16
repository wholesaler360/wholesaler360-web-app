import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { Vendor } from "./vendor-model.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import { Role } from "../roles/role-model.js";
import { uploadFile, deleteFromLocalPath } from "../../utils/cloudinary-utils.js";


const createVendor = asyncHandler(async(req, res, next)=>{
    const {name, mobileNo, email, gstin, address, bankDetails, balance} = req.body;

    if ([name, mobileNo, email, address, bankDetails].some((field) => !field?.trim())) {
        return next(ApiError.validationFailed("Please provide all required fields"));
    }

    const existingVendor = await Vendor.findOne({ 
        $or: [{ email }, { mobileNo }],
    });

    if(existingVendor) {
        deleteFromLocalPath(req.files?.avatar?.[0]?.path);
        return next(ApiError.valueAlreadyExists("Vendor Already Exists"))
    }

    let avatar;
    console.log('avatar path', req.files?.avatar?.[0]?.path);

    // Handle avatar upload
    if(req.files?.avatar?.[0]?.path) {
        avatar = await uploadFile(req.files.avatar[0].path);
    }

    try {
        const vendorCreated = await Vendor.create({
            createdBy: req.user._id,
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
        return next(ApiError.dataNotInserted("Vendor not created"));
    }
});
