import 'dotenv/config';
import {User} from '../users/user-model.js';
import { ApiError } from '../../utils/api-error-utils.js';
import { ApiResponse } from '../../utils/api-Responnse-utils.js';
import { asyncHandler } from '../../utils/asyncHandler-utils.js';
import jwt from 'jsonwebtoken';

const login = asyncHandler(async(req,res,next)=>{
    // take the values and validate it
    const {mobileNo,password} = req.body;

    if ([mobileNo , password].some((field) => !field?.trim()==="")) {
        return next(ApiError.validationFailed("Please provide all required fields"));
    }
    
    // Checks if the user already exists
    const user = await User.findOne({mobileNo : mobileNo});
    console.log(user);
    if(!user || user?.isUserDeleted)
    {
        return next(ApiError.dataNotFound("User not found"));
    }

    // Checks if the password is correct
    const isPasswordMatched = await user.isPasswordCorrect(password)

    if(!isPasswordMatched)
    {
        return next(ApiError.validationFailed("Invalid Credentials"));
    }

    // Generate access token and refresh token
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    
    console.log("------------------------------------LOGIN---------------------------");
    console.log("\nAccess Token received:", accessToken, "\n");
    console.log("\nRefresh Token received:", refreshToken, "\n");
    console.log("---------------------------------------------------------------------")

    // Save the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save();

    const options = {
        httpOnly: true,
        secure : process.env.NODE_ENV === 'production'
    }

    res.status(200)
        .cookie('refreshToken',refreshToken,options)
        .json(ApiResponse.successRead({user,accessToken},"User Logged In Successfully"));

});

const refreshAccessToken = asyncHandler(async(req,res,next)=>{  
    const {refreshToken} = req.cookies;
    if(!refreshToken)
        {
            return next(ApiError.validationFailed("Please provide the tokens"));
        }
    console.log("-------------------------------REFRESH ACCESS TOKEN-----------------------------");
    console.log("\nRefresh Token received:", refreshToken, "\n");
    try {
        const decodedRefreshToken = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET) 
        if(!decodedRefreshToken)
        {
            return next(ApiError.tokenNotFound("Invalid Refresh Token"));
        }

        const user = await User.findById(decodedRefreshToken._id);
        if (!user || user.refreshToken !== refreshToken) {
            // TODO : Redirect to login page
            user.refreshToken = undefined;
            return next(ApiError.unauthorizedAccess("User Does Not Exists or Login Again"));
        }

        const newAccessToken = await user.generateAccessToken();
        const newRefreshToken = await user.generateRefreshToken();
        console.log("------------------------------------REFRESH---------------------------");
        console.log("Access Token :",newAccessToken,"\n\n");
        console.log("Refresh Token :",newRefreshToken,);
        console.log("----------------------------------------------------------------------");
        
        user.refreshToken = newRefreshToken;
        await user.save();
        
        const options = {
            httpOnly: true,
            secure : process.env.NODE_ENV === 'production'
        }
        
        console.log("----------------------------------------------------------------------");
        res.cookie('refreshToken', newRefreshToken, options);
        res.status(200).json(ApiResponse.successRead({user,newAccessToken},"Token Refreshed Successfully"));
    } catch (error) {
        // TODO : Redirect to login page
        return next(ApiError.dataNotInserted("Unable to generate new access Token"));
    }
});

const logout = asyncHandler(async(req,res,next)=>{
    const {refreshToken} = req.cookies;
    if(!refreshToken)
    {
        return next(ApiError.validationFailed("Please provide the tokens"));
    }
    console.log("---------------------------------LOGOUT-----------------------------");
    console.log(refreshToken);
    try {
        const decodedRefreshToken = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
        if (!decodedRefreshToken || !decodedRefreshToken._id) {
            return next(ApiError.validationFailed("Invalid refresh token"));
        }
        const loggedOutUser =  await User.findByIdAndUpdate(
            //Uses middleware to find the user and update the refreshtoken to undefined    
            decodedRefreshToken._id,
                {
                    $set: {
                    refreshToken : null,
                  }
              },
                {
                  new : true,
                }
              ) 
                //Returns the new updated user
            if (!loggedOutUser) {
                return next(ApiError.validationFailed("User not found or already logged out"));
            }

            // await loggedOutUser.save();
            const options = {
              httpOnly:true,
              secure : process.env.NODE_ENV === "production",
            }
            console.log("------------------------------------------------------------------------");
            res.status(200)
            .clearCookie("refreshToken",options)
            .json(ApiResponse.successUpdated(loggedOutUser,"User Logged Out Successfully"))
    } catch (error) {
        return next(ApiError.dataNotInserted("Unable to logout"));
    }
});

export {login , refreshAccessToken , logout};