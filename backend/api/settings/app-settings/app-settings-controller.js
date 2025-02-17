import { ApiResponse } from "../../../utils/api-Responnse-utils.js";
import { ApiError } from "../../../utils/api-error-utils.js";
import { asyncHandler } from "../../../utils/asyncHandler-utils.js";
import { AppEmailSettings } from "./app-settings-model.js";


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

export { fetchAppEmailSettings, updateAppEmailSettings };