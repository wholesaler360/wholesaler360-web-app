import { ApiResponse } from "../../../utils/api-Responnse-utils.js";
import { ApiError } from "../../../utils/api-error-utils.js";
import { asyncHandler } from "../../../utils/asyncHandler-utils.js";
import { CompanyDetails, CompanyBankDetails, CompanySignatures } from "./company-settings-model.js";
import {
  uploadFile,
  deleteFromLocalPath,
  deleteFromCloudinary,
} from "../../../utils/cloudinary-utils.js";


// Helper function to update company logo or favicon
const updateCompanyFile = async (fileType, file, companyDetails) => {
  const oldFileUrl = fileType === 'logo' ? 
    companyDetails.logoUrl : 
    companyDetails.faviconUrl;

  let uploadedFile;
  try {
    uploadedFile = await uploadFile(file?.path);
  } catch (error) {
    throw ApiError.dataNotUpdated(`Failed to update company ${fileType}`, error);
  } finally {
    deleteFromLocalPath(file?.path);
  }

  if (fileType === 'logo') {
    companyDetails.logoUrl = uploadedFile;
  } else {
    companyDetails.faviconUrl = uploadedFile;
  }

  const updatedCompany = await companyDetails.save();
  const { isDeleted, __v, _id, ...remaining } = updatedCompany.toObject();

  // If old file exists in cloudinary, delete it
  if (oldFileUrl) {
    deleteFromCloudinary(oldFileUrl);
  }

  return remaining;
};


const updateCompanyDetails = asyncHandler(async (req, res, next) => {
  const {
    name,
    mobileNo,
    gstin,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    country,
    termsAndConditions,
  } = req.body;

  // Check if all the required fields are present or not
  if (
    [
      name,
      mobileNo,
      addressLine1,
      city,
      state,
      pincode,
      country,
    ].some((field) =>
      // Apply trim only if field is a string
      typeof field === "string" ? !field.trim() : !field
    )
  ) {
    return next(
      ApiError.validationFailed("Please provide all the required fields")
    );
  }

  const address = {
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    country,
  };

  try {
    const companyDetails = await CompanyDetails.find();
    if (companyDetails.length !== 1) {
      return next(ApiError.validationFailed("Something went wrong: Company not found"));
    }
    
    companyDetails[0].name = name;
    companyDetails[0].mobileNo = mobileNo;
    companyDetails[0].gstin = gstin;
    companyDetails[0].address = address;
    companyDetails[0].termsAndConditions = termsAndConditions;
    
    const savedCompanyDetails = await companyDetails[0].save();

    const { isDeleted, __v, _id, ...remaining } = savedCompanyDetails.toObject();

    return res
      .status(201)
      .json(
        ApiResponse.successUpdated(remaining, "Company details updated successfully")
      );
      
  } catch (error) {
    console.log(`Error updating company details: ${error}`);
    return next(ApiError.dataNotUpdated("Failed to update company details", error));
  } 
});


const fetchCompanyDetails = asyncHandler(async (req, res, next) => {
  try {
    const companyDetails = await CompanyDetails.find();
    if (companyDetails.length !== 1) {
      return next(ApiError.validationFailed("Something went wrong: Company Details not found"));
    }
    
    const { isDeleted, __v, _id, ...remaining } = companyDetails[0].toObject();

    return res
      .status(201)
      .json(
        ApiResponse.successRead(remaining, "Company details fetched successfully")
      );
      
  } catch (error) {
    console.log(`Error fetching company details: ${error}`);
    return next(new ApiError(500, "Failed to fetch company details"));
  } 
});


const updateCompanyLogo = asyncHandler(async (req, res, next) => {
  try {
    const companyDetails = await CompanyDetails.find();
    if (companyDetails.length !== 1) {
      return next(ApiError.validationFailed("Company Details not found"));
    }

    const remaining = await updateCompanyFile('logo', req.files?.logo?.[0], companyDetails[0]);

    return res
      .status(200)
      .json(
        ApiResponse.successUpdated(remaining, "Company logo updated successfully")
      );
  } catch (error) {
    deleteFromLocalPath(req.files?.logo?.[0]?.path);
    return next(error);
  }
});


const updateCompanyFavicon = asyncHandler(async (req, res, next) => {
  try {
    const companyDetails = await CompanyDetails.find();
    if (companyDetails.length !== 1) {
      return next(ApiError.validationFailed("Company Details not found"));
    }

    const remaining = await updateCompanyFile('favicon', req.files?.favicon?.[0], companyDetails[0]);

    return res
      .status(200)
      .json(
        ApiResponse.successUpdated(remaining, "Company favicon updated successfully")
      );
  } catch (error) {
    deleteFromLocalPath(req.files?.favicon?.[0]?.path);
    return next(error);
  }
});


const updateCompanyBankDetails = asyncHandler(async (req, res, next) => {
  const {
    bankName,
    accountNumber,
    accountHolderName,
    ifsc,
    upiId,
  } = req.body;

  if (
    [
      accountHolderName,
      accountNumber,
      ifsc,
      bankName,
      upiId,
    ].some((field) =>
      // Apply trim only if field is a string
      typeof field === "string" ? !field.trim() : !field
    )
  ) {
    return next(
      ApiError.validationFailed("Please provide all the required fields")
    );
  }

  try {
    const companyBankDetails = await CompanyBankDetails.find();
    if (companyBankDetails.length > 1) {
      return next(ApiError.validationFailed("Something went wrong: Company's Bank Details not found"));
    }
    
    let savedCompanyBankDetails;
    if (companyBankDetails.length === 0){
      const newCompanyBankDetails = new CompanyBankDetails({
        accountHolderName,
        accountNumber,
        ifsc,
        bankName,
        upiId,
      });
      savedCompanyBankDetails = await newCompanyBankDetails.save();
    
    }else{
      companyBankDetails[0].accountHolderName = accountHolderName;
      companyBankDetails[0].accountNumber = accountNumber;
      companyBankDetails[0].ifsc = ifsc;
      companyBankDetails[0].bankName = bankName;
      companyBankDetails[0].upiId = upiId;
    
      savedCompanyBankDetails = await companyBankDetails[0].save();
    }
    
    const { isDeleted, __v, _id, ...remaining } = savedCompanyBankDetails.toObject();

    return res
      .status(201)
      .json(
        ApiResponse.successUpdated(remaining, "Company's Bank details updated successfully")
      );
      
  } catch (error) {
    console.log(`Error updating company bank details: ${error}`);
    return next(ApiError.dataNotInserted("Failed to update company's bank details", error));
  } 
});


const fetchCompanyBankDetails = asyncHandler(async (req, res, next) => {
  try {
    const companyBankDetails = await CompanyBankDetails.find();
    if (companyBankDetails.length !== 1) {
      return next(ApiError.validationFailed("Company's Bank Details not found"));
    }
    
    const { isDeleted, __v, _id, ...remaining } = companyBankDetails[0].toObject();

    return res
      .status(200)
      .json(
        ApiResponse.successRead(remaining, "Company's Bank details fetched successfully")
      );
      
  } catch (error) {
    console.log(`Error fetching company bank details: ${error}`);
    return next(new ApiError(500, "Failed to fetch company's bank details"));
  }
});


const addCompanySignature = asyncHandler(async (req, res, next) => {
  const {
    name,
  } = req.body;

  if (
    !name
  ) {
    return next(
      ApiError.validationFailed("Signature name is required")
    );
  }

  try {
    const existedSignature = await CompanySignatures.findOne({ name: name, isDeleted: false });
    
    if (existedSignature) {
      return next(ApiError.validationFailed("Signature already exists"));
    }

    let signatureUrl;
    try {
      signatureUrl = await uploadFile(req.files?.signature?.[0]?.path);
    } catch (error) {
      return next(ApiError.dataNotUpdated(`Failed to upload new signature`, error));
    } finally {
      deleteFromLocalPath(req.files?.signature?.[0]?.path);
    }

    if(!signatureUrl){
      return next(ApiError.dataNotInserted("Failed to upload new signature"));
    }

    const newSignature = new CompanySignatures({
      name,
      signatureUrl: signatureUrl,
    });

    const savedSignature = await newSignature.save();

    const { isDeleted, __v, _id, ...remaining } = savedSignature.toObject();

    return res
      .status(201)
      .json(
        ApiResponse.successCreated(remaining, "New signature added successfully")
      );
      
  } catch (error) {
    console.log(`Error adding new signature: ${error}`);
    deleteFromLocalPath(req.files?.signature?.[0]?.path);
    return next(ApiError.dataNotInserted("Failed to add new signature", error));
  } 
});

const deleteCompanySignature = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  try {
    const signature = await CompanySignatures.findOne({ name: name, isDeleted: false });
    
    if (!signature) {
      return next(ApiError.validationFailed("Signature not found"));
    }

    signature.isDeleted = true;
    const deletedSignature = await signature.save();

    const { __v, _id, ...remaining } = deletedSignature.toObject();

    return res
      .status(200)
      .json(
        ApiResponse.successDeleted(remaining, "Signature deleted successfully")
      );

  } catch (error) {
    console.log(`Error deleting signature: ${error}`);
    return next(ApiError.dataNotUpdated("Failed to delete signature", error));
  }
});

const fetchCompanySignatures = asyncHandler(async (req, res, next) => {
  try {
    const signatures = await CompanySignatures.find({ isDeleted: false }, { __v: 0, _id: 0, updatedAt: 0, isDeleted: 0 });

    return res
      .status(200)
      .json(
        ApiResponse.successRead(signatures, "Signatures fetched successfully")
      );
      
  } catch (error) {
    console.log(`Error fetching signatures: ${error}`);
    return next(new ApiError(500, "Failed to fetch signatures"));
  }
});

export { 
  updateCompanyDetails, 
  fetchCompanyDetails, 
  updateCompanyLogo,
  updateCompanyFavicon,
  updateCompanyBankDetails,
  fetchCompanyBankDetails,
  addCompanySignature,
  deleteCompanySignature,
  fetchCompanySignatures
};