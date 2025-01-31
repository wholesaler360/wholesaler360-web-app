import { ApiError } from '../utils/api-error-utils.js';
import { universalValidationSchema } from '../utils/formatValidator-utils.js';
import { asyncHandler } from '../utils/asyncHandler-utils.js';
import fs from 'fs';

const formatValidator = asyncHandler(async (req, res, next) => {
    let localPath = [];
    try {
        //This is to take out the file path from the request without knowing the field name
        // It works for multiple files upload only
        if(req.files && Object.keys(req.files).length > 0){
            for(const fieldName in req.files){
                    localPath.push({fieldName : fieldName,path : req.files[fieldName]?.[0].path});
                    console.log(`File uploaded with field name: ${fieldName}, path: ${req.files[fieldName]?.[0].path}`);
                }
            }   
        const validData = await universalValidationSchema.parseAsync(req.body);
        req.body = validData; // Replace body with validated data
        localPath = [];
        return next();
    } catch (error) {
        for(const file of localPath){
            // Delete the uploaded file
            fs.unlinkSync(file.path);
        }
        if (error.issues) {
            // Pass only the first error message
            return next(ApiError.validationFailed(error.issues[0].message));
        }
        return next(ApiError.validationFailed(error.message));
    } 
});

export default formatValidator;