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
    const refreshToken = req.cookies.refreshToken;
    console.log("Refresh Token:",refreshToken);
    console.log("---------------------------------MIDDLEWARE-----------------------------");
    console.log("\nAccess Token received:", accessToken, "\n");
    
    if(!accessToken)
    {
        return next(ApiError.validationFailed("Please provide the tokens"));
    }
    // Logout the user if the refresh token is not provided
    if(!refreshToken){
        return next(ApiError.unauthorizedAccess("Please provide the refresh tokens or Login again"));
    }

    let decodedAccessToken;

    try {
        decodedAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        if(error.name === 'TokenExpiredError')
        {
            return next(new ApiError(400,error.message));
        }
        else
        {
            try{
                const options = {
                    httpOnly:true,
                    secure : true,
                    sameSite : 'none'
                }
                res.clearCookie('refreshToken',options);
                let decodedRefreshToken = jwt.decode(req.cookies.refreshToken);
                if(decodedRefreshToken?._id){
                    const user = await User.findById(decodedRefreshToken._id);
                    user.refreshToken = null;
                    await user.save();
                }
                return next(new ApiError(400,error.message + " Invalid Access Token Login Again"));
            }
            catch(error){
                console.log("Error while logging out the user due to non token expiry errors: ",error);
                return next(new ApiError(400,error.message + "Error while logging out the user due to non token expiry errors"));
            }
        }

    }

    try {
        
        
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
        if (!user || user?.isUserDeleted) {
            return next(ApiError.dataNotFound("User not found"));
        }
        //Logout the user if the refresh token is not valid        
        if(user.refreshToken !== refreshToken){
            return next(ApiError.unauthorizedAccess("Password is changed or you donot have access login Again"));
        }
        
        console.log("Checking for the user permissions");
        console.log(requestType, " ", requestModule);
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
        return next(ApiError.unauthorizedAccess("You don't have permission to access this module"));
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
})

export default authMiddleware;