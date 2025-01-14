import 'dotenv/config';
import {User} from '../api/users/user-model.js';
import { ApiError } from '../utils/api-error-utils.js';
import { ApiResponse } from '../utils/api-Responnse-utils.js';
import { asyncHandler } from '../utils/asyncHandler-utils.js';
import jwt from 'jsonwebtoken'
import {requestVerify} from '../utils/convert-array-to-binary-utils.js'

const authMiddleware = asyncHandler(async(req,res,next)=>{
    const accessToken = req.headers["authorization"];
    const refreshToken = req.headers["authorization"];
    console.log("frontend", accessToken, "\n \n", refreshToken);

    if(!accessToken && !refreshToken)
    {
        // TODO : check this 
        return res.redirect('/login');
    }

    try {
        const decodedAccessToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
        
        if(!decodedAccessToken)
        {
            const decodedRefreshToken = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET) 
            if(!decodedRefreshToken)
            {
                return next(ApiError.tokenNotFound());
            }
            const user = await User.findById(decodedRefreshToken.user_id);
            
            if(!user.refreshToken === refreshToken)
            {
                return next(ApiError.unauthorized("Login Again"));
            }

            const newAccessToken = await user.generateAccessToken();
            const newRefreshToken = await user.generateRefreshToken();
            console.log(accessToken);
            console.log(refreshToken);

            user.refreshToken = newRefreshToken;
            await user.save();

            const options = {
                httpOnly: true,
                secure : process.env.NODE_ENV === 'production',
                // TODO : check below line
                sameSite : process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax'
            }

            res.cookie('accessToken', newAccessToken, options);
            res.cookie('refreshToken', newRefreshToken, options);

            req.user_id = user._id;
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
        console.log(requestType," ",requestModule);
        console.log(user);
        if (!user || user.isUserDeleted) {
            return next(ApiError.dataNotFound("User not found"));
        }

        if (!user.role || !user.role.sections || !Array.isArray(user.role.sections)) {
            console.log("ujas");
            return next(ApiError.unauthorizedAccess("User does not have valid sections assigned"));
        }

        for (const element of user.role.sections) {
            console.log(element.module.name," ",element.permission,requestVerify(element.permission));
            if (String(element.module.name) === requestModule && requestVerify(element.permission , requestType)) {
                req.fetchedUser = user; // Pass user to next middleware/controller
                return next();
            }
        }
        return next(ApiError.unauthorizedAccess("You don't have permission to access this module"));

    } catch (error) {
        return next(new ApiError(500, error.message));
    }
    
})

export default authMiddleware;