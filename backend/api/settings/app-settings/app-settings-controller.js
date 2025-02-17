import { ApiResponse } from "../../../utils/api-Responnse-utils.js";
import { ApiError } from "../../../utils/api-error-utils.js";
import { asyncHandler } from "../../../utils/asyncHandler-utils.js";
import { AppEmailSettings } from "./app-settings-model.js";
import {
  uploadFile,
  deleteFromLocalPath,
  deleteFromCloudinary,
} from "../../../utils/cloudinary-utils.js";


const fetchAppEmailSettings = asyncHandler(async (req, res, next) => {
    const appEmailSettings = await AppEmailSettings.findOne();
    if (!appEmailSettings) {
        return next(ApiError.dataNotFound("Email settings found"));
    }
    return res
      .status(201)
      .json(
        ApiResponse.successRead(appEmailSettings, "Email settings fetched successfully")
      );
});

const updateAppEmailSettings = asyncHandler(async (req, res, next) => {
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
          .status(201)
          .json(
            ApiResponse.successUpdated(remaining, "Email settings updated successfully")
          );
          
    } catch (error) {
        console.log(`Error updating email settings: ${error}`);
        return next(ApiError.dataNotInserted("Failed to update email settings", error));
    }
});

export { fetchAppEmailSettings, updateAppEmailSettings };