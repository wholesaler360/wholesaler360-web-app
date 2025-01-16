import 'dotenv/config';
import {User} from '../api/users/user-model.js';
import { ApiError } from '../utils/api-error-utils.js';
import { ApiResponse } from '../utils/api-Responnse-utils.js';
import { asyncHandler } from '../utils/asyncHandler-utils.js';
import jwt from 'jsonwebtoken'
import {requestVerify} from '../utils/convert-array-to-binary-utils.js'

const authMiddleware = asyncHandler(async(req,res,next)=>{
    const authHeader = req.headers["authorization"];
    const accessToken = authHeader ? authHeader.split(' ')[1] : null;

    console.log("---------------------------------MIDDLEWARE-----------------------------");
    console.log("\nAccess Token received:", accessToken, "\n");
    
    if(!accessToken)
    {
        return next(ApiError.validationFailed("Please provide the tokens"));
    }

    try {
        const decodedAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        
        if(!decodedAccessToken)
        {
            return next(ApiError.tokenNotFound("Token not Decoded or Expired"));
        }

        const requestType = req.method
        const requestModule = req.originalUrl.split('/')[1];

        const user = await User.findById(decodedAccessToken._id).populate({
            path: 'role',
            populate: {
                path: 'sections.module', // Populate the 'sections' field inside 'role'
                model: 'Module',        // Replace 'Section' with the actual model name for the sections
            },
        });
        
        console.log("Checking for the user permissions");
        console.log(requestType, " ", requestModule);

        if (!user || user?.isUserDeleted) {
            return next(ApiError.dataNotFound("User not found"));
        }
        
        if (!user?.role || !user?.role.sections || !Array.isArray(user?.role.sections)) {
            return next(ApiError.unauthorizedAccess("User does not have valid sections assigned"));
        }

        for (const element of user.role.sections) {
            console.log("Checking for the module and permission");
            console.log(element.module.name," ",element.permission,requestVerify(element.permission,requestType));
            if (String(element.module.name) === requestModule ) {
                if(requestVerify(element.permission , requestType))
                {
                    req.fetchedUser = user; // Pass user to next middleware/controller
                    console.log("------------------------------------------------------------------------")
                    return next();
                }
                console.log("------------------------------------------------------------------------")
                return next(ApiError.unauthorizedAccess("You don't have permission to access this module"));
            }
        }
    } catch (error) {
        return next(new ApiError(500,error.message));
    }
})

export default authMiddleware;