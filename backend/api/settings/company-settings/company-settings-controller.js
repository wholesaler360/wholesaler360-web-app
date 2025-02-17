import { ApiResponse } from "../../../utils/api-Responnse-utils.js";
import { ApiError } from "../../../utils/api-error-utils.js";
import { asyncHandler } from "../../../utils/asyncHandler-utils.js";
import { CompanyDetails } from "./company-settings-model.js";
import {
  uploadFile,
  deleteFromLocalPath,
  deleteFromCloudinary,
} from "../../../utils/cloudinary-utils.js";


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


const addCompanyDetails = asyncHandler(async (req, res, next) => {
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
        ApiResponse.successCreated(remaining, "Company details updated successfully")
      );
      
  } catch (error) {
    console.log(`Error updating company details: ${error}`);
    return next(ApiError.dataNotInserted("Failed to update company details", error));
  } 
});


const fetchCompanyDetails = asyncHandler(async (req, res, next) => {
  try {
    const companyDetails = await CompanyDetails.find({});
    if (companyDetails.length !== 1) {
      return next(ApiError.validationFailed("Company Details not found"));
    }
    
    const { isDeleted, __v, _id, ...remaining } = companyDetails[0].toObject();

    return res
      .status(201)
      .json(
        ApiResponse.successCreated(remaining, "Company details fetched successfully")
      );
      
  } catch (error) {
    console.log(`Error fetching company details: ${error}`);
    return next(ApiError.dataNotInserted("Failed to fetch company details", error));
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


export { 
  addCompanyDetails, 
  fetchCompanyDetails, 
  updateCompanyLogo,
  updateCompanyFavicon 
};