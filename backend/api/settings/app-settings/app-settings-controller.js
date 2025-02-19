import { ApiResponse } from "../../../utils/api-Responnse-utils.js";
import { ApiError } from "../../../utils/api-error-utils.js";
import { asyncHandler } from "../../../utils/asyncHandler-utils.js";
import { AppEmailSettings, AppInvoiceTemplates } from "./app-settings-model.js";


const fetchAppEmailSettings = asyncHandler(async (req, res, next) => {
    const appEmailSettings = await AppEmailSettings.findOne();
    if (!appEmailSettings) {
        return next(ApiError.dataNotFound("Email settings not found"));
    }
    return res
      .status(200)
      .json(
        ApiResponse.successRead(appEmailSettings, "Email settings fetched successfully")
      );
});

const updateAppEmailSettings = asyncHandler(async (req, res, next) => {
  const {
    email,
    credential,
    smtpHost,
    smtpPort,
  } = req.body;

  if (
    [
      email,
      credential,
      smtpHost,
      smtpPort,
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
      const existedEmailSettings = await AppEmailSettings.find();
      if (existedEmailSettings.length > 1) {
        return next(ApiError.validationFailed("Something went wrong: Email settings not found"));
      }
      
      let savedEmailSettings;
      if (existedEmailSettings.length === 0){
        const newEmailSettings = new AppEmailSettings({
          email: email,
          credential: credential,
          smtpHost: smtpHost,
          smtpPort: smtpPort,
        });
        savedEmailSettings = await newEmailSettings.save();
      
      }else{
        existedEmailSettings[0].email = email;
        existedEmailSettings[0].credential = credential;
        existedEmailSettings[0].smtpHost = smtpHost;
        existedEmailSettings[0].smtpPort = smtpPort;
      
        savedEmailSettings = await existedEmailSettings[0].save();
      }
      
      const { isDeleted, __v, _id, ...remaining } = savedEmailSettings.toObject();
  
      return res
        .status(200)
        .json(
          ApiResponse.successUpdated(remaining, "Email settings updated successfully")
        );
        
  } catch (error) {
      console.log(`Error updating email settings: ${error}`);
      return next(ApiError.dataNotUpdated("Failed to update email settings", error));
  }
});


const fetchDefaultInvoiceTemplate = asyncHandler(async (req, res, next) => {
  const defaultInvoiceTemplate = await AppInvoiceTemplates.findOne();
  if (!defaultInvoiceTemplate) {
    return next(ApiError.dataNotFound("Default invoice template not found"));
  }
  const { __v, _id, createdAt, ...remaining } = defaultInvoiceTemplate.toObject();
  return res
    .status(200)
    .json(
      ApiResponse.successRead(remaining, "Default invoice template fetched successfully")
    );
});


const updateDefaultInvoiceTemplate = asyncHandler(async (req, res, next) => {
  const { defaultInvoiceTemplate } = req.body;

  if (!defaultInvoiceTemplate) {
    return next(
      ApiError.validationFailed("Please provide all the required fields")
    );
  }

  try {
    const existedInvoiceTemplate = await AppInvoiceTemplates.find();
    if (existedInvoiceTemplate.length > 1) {
      return next(ApiError.validationFailed("Something went wrong: Invoice templates not found"));
    }
    
    let savedInvoiceTemplate;
    if (existedInvoiceTemplate.length === 0){
      const newInvoiceTemplate = new AppInvoiceTemplates({
        defaultInvoiceTemplate: defaultInvoiceTemplate,
      });
      savedInvoiceTemplate = await newInvoiceTemplate.save();
    
    }else{
      existedInvoiceTemplate[0].defaultInvoiceTemplate = defaultInvoiceTemplate;
    
      savedInvoiceTemplate = await existedInvoiceTemplate[0].save();
    }
    
    const { __v, _id, createdAt, ...remaining } = savedInvoiceTemplate.toObject();

    return res
      .status(200)
      .json(
        ApiResponse.successUpdated(remaining, "Default invoice template updated successfully")
      );
        
  } catch (error) {
      console.log(`Error updating default invoice template: ${error}`);
      return next(ApiError.dataNotUpdated("Failed to update default invoice template", error));
  }
});

export { fetchAppEmailSettings, updateAppEmailSettings, fetchDefaultInvoiceTemplate, updateDefaultInvoiceTemplate };