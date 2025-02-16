import { ApiResponse } from "../../../utils/api-Responnse-utils.js";
import { ApiError } from "../../../utils/api-error-utils.js";
import { asyncHandler } from "../../../utils/asyncHandler-utils.js";
import { CompanyDetails } from "./company-settings-model.js";
import {
  uploadFile,
  deleteFromLocalPath,
  deleteFromCloudinary,
} from "../../../utils/cloudinary-utils.js";


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
      
      const savedCompanyDetails = await companyDetails.save();
  
      const { isDeleted, __v, ...remaining } = savedCompanyDetails.toObject();
  
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