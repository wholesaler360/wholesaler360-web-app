import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { Vendor } from "./vendor-model.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import { uploadFile, deleteFromLocalPath, deleteFromCloudinary } from "../../utils/cloudinary-utils.js";


const createVendor = asyncHandler(async(req, res, next)=>{
    const {
        name, mobileNo, email, gstin, payableBalance, 
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
        $or: [{ email, isDeleted: false}, { mobileNo, isDeleted: false }],
    });

    if(existingVendor) {
        deleteFromLocalPath(req.files?.avatar?.[0]?.path);
        return next(ApiError.valueAlreadyExists("Vendor Already Exists"))
    }

    const existingGstin = await Vendor.findOne({ 
        gstin,
        isDeleted: false    
    });

    if(existingGstin) {
        deleteFromLocalPath(req.files?.avatar?.[0]?.path);
        return next(ApiError.valueAlreadyExists("GSTIN is already associated with another vendor"))
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
            payableBalance: payableBalance || 0.0
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
    }, { 
        __v: 0, 
        deletedAt: 0, 
        updatedAt: 0,
        createdAt: 0 
    });
    
    if (!vendors?.length) {
        return next(ApiError.dataNotFound("No vendors found"));
    }

    return res.status(200).json(
        ApiResponse.successRead(vendors, "Vendors fetched successfully")
    );
});


const fetchVendor = asyncHandler(async(req, res, next) => {
    const {mobileNo} = req.body;

    if (!mobileNo?.trim()) {
        return next(ApiError.validationFailed("Mobile number is required"));
    }

    // TODO : Mobile number validations

    // This will fetch the deleted vendors also 
    const vendor = await Vendor.findOne({ 
        mobileNo,
        isDeleted: false 
    }, { 
        __v: 0,     
        deletedAt: 0,
        updatedAt: 0,
        createdAt: 0
    });

    if (!vendor) {
        return next(ApiError.dataNotFound("Vendor not found"));
    }
    
    return res.status(200).json(
        ApiResponse.successRead(vendor, "Vendor fetched successfully")
    );
});


const deleteVendor = asyncHandler(async(req, res, next) => {
    const {mobileNo} = req.body;

    if (!mobileNo?.trim()) {
        return next(ApiError.validationFailed("Mobile number is required"));
    }

    // TODO : Mobile number validations and do all the input validations at everywhere

    const vendor = await Vendor.findOne({ mobileNo });

    if (!vendor || vendor.isDeleted) {
        return next(ApiError.dataNotFound("Vendor not found"));
    }

    if (vendor.payableBalance !== 0) {
        return next(ApiError.validationFailed("Cannot delete vendor with payable balance remaining"));
    }
    
    try {
        vendor.isDeleted = true;
        const imgUrl = vendor.imageUrl
        vendor.imageUrl = null;

        await vendor.save();
        deleteFromCloudinary(imgUrl);

        return res.status(200).json(
            ApiResponse.successDeleted("Vendor deleted successfully")
        );
    } catch (error) {

        return next(new ApiError(500, error.message));
    }

});

const updateVendor = asyncHandler(async(req, res, next) => {
    const {
        mobileNo, newMobileNo, 
        name, email, gstin, addressLine1, 
        addressLine2, city, state, postalCode,
        country, branchName, ifsc, bankName, accountNumber
    } = req.body;

    if (!mobileNo?.trim()) {
        return next(ApiError.validationFailed("Mobile number is required for updating vendor"));
    }

    const vendor = await Vendor.findOne({ mobileNo , isDeleted: false });

    if (!vendor) {
        return next(ApiError.dataNotFound("Vendor not found"));
    }

    // Check if new email already exists for another vendor
    if (email && email !== vendor.email) {
        const emailExists = await Vendor.findOne({ email , isDeleted: false });
        if (emailExists) {
            return next(ApiError.valueAlreadyExists("Email is already registered with another vendor"));
        }
    }

    // Check if new mobile number already exists for another vendor
    if (newMobileNo && newMobileNo !== vendor.mobileNo) {
        const newMobileNoExists = await Vendor.findOne({ newMobileNo , isDeleted: false });
        if (newMobileNoExists) {
            return next(ApiError.valueAlreadyExists("Mobile number is already registered with another vendor"));
        }
    }

    // Check if new gstin already exists for another vendor
    if (gstin && gstin !== vendor.gstin) {
        const gstinExists = await Vendor.findOne({ gstin , isDeleted: false });
        if (gstinExists) {
            return next(ApiError.valueAlreadyExists("GSTIN is already associated with another vendor"));
        }
    }

    // Update vendor fields
    vendor.name = name || vendor.name;
    vendor.mobileNo = newMobileNo || vendor.mobileNo;
    vendor.email = email || vendor.email;
    vendor.gstin = gstin || vendor.gstin;
    vendor.address.addressLine1 = addressLine1 || vendor.address.addressLine1;
    vendor.address.addressLine2 = addressLine2 || vendor.address.addressLine2;
    vendor.address.city = city || vendor.address.city;
    vendor.address.state = state || vendor.address.state;
    vendor.address.postalCode = postalCode || vendor.address.postalCode;
    vendor.address.country = country || vendor.address.country;
    vendor.bankDetails.branchName = branchName || vendor.bankDetails.branchName;
    vendor.bankDetails.ifsc = ifsc || vendor.bankDetails.ifsc;
    vendor.bankDetails.bankName = bankName || vendor.bankDetails.bankName;
    vendor.bankDetails.accountNumber = accountNumber || vendor.bankDetails.accountNumber;

    try {
        const updatedVendor = await vendor.save();
        const {createdBy, __v, updatedAt, createdAt, ...remaining} = updatedVendor.toObject();
        
        return res.status(200).json(
            ApiResponse.successUpdated(remaining, "Vendor updated successfully")
        );
    } catch (error) {
        return next(ApiError.dataNotUpdated("Failed to update vendor", error));
    }
});


const updateAvatar = asyncHandler(async(req, res, next) => {
    const { mobileNo } = req.body;

    if (!mobileNo?.trim()) {
        return next(ApiError.validationFailed("Mobile number is required for updating avatar"));
    }

    const vendor = await Vendor.findOne({ mobileNo, isDeleted: false });

    if (!vendor) {
        return next(ApiError.dataNotFound("Vendor not found"));
    }

    const oldAvatarUrl = vendor.imageUrl;

    // Handle avatar upload
    let avatar;
    if (req.files?.avatar?.[0]?.path) {
        avatar = await uploadFile(req.files.avatar[0].path);
    }
    else {
        return next(ApiError.validationFailed("Avatar is required"));
    }

    // Delete old avatar from cloudinary only if new avatar is uploaded
    if (avatar) {
        vendor.imageUrl = avatar;
        
        // If old avatar exists, delete it from cloudinary
        if (oldAvatarUrl) {
            deleteFromCloudinary(oldAvatarUrl);
        }
    }
    else {
        return next(ApiError.dataNotUpdated("Failed to update avatar"));
    }

    try {
        const updatedVendor = await vendor.save();
        const {createdBy, __v, updatedAt, createdAt, ...remaining} = updatedVendor.toObject();

        return res.status(200).json(
            ApiResponse.successUpdated(remaining, "Avatar updated successfully")
        );

    } catch (error) {
        return next(ApiError.dataNotUpdated("Failed to update avatar", error));
    }
});


export { createVendor, fetchAllVendors, fetchVendor, deleteVendor, updateVendor, updateAvatar };
