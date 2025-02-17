import 'dotenv/config';
import {User} from '../users/user-model.js';
import { ApiError } from '../../utils/api-error-utils.js';
import { ApiResponse } from '../../utils/api-Responnse-utils.js';
import { asyncHandler } from '../../utils/asyncHandler-utils.js';
import  sendMail  from '../../utils/mail-sender-utils.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const login = asyncHandler(async(req,res,next)=>{
    // take the values and validate it
    const {mobileNo, password} = req.body;

    if ([mobileNo , password].some((field) => !field?.trim())) {
        return next(ApiError.validationFailed("Please provide all required fields"));
    }
    
    // Checks if the user already exists
    const user = await User.findOne({mobileNo : mobileNo}).
    populate({path : "role" ,select : "name -_id"})
    .select("-otp -otpExpiration ");
    console.log(user);
    if(!user || user.isUserDeleted)
    {
        return next(ApiError.dataNotFound("User not found"));
    }

    // Checks if the password is correct
    const isPasswordMatched = await user.isPasswordCorrect(password)

    if(!isPasswordMatched)
    {
        return next(ApiError.validationFailed("Invalid mobileNo or Password"));
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
        secure : process.env.NODE_ENV === 'production',
        sameSite : 'none'
    }
    const { password : $password, refreshToken: $userRefreshToken, ...sanitizedUser } = user.toObject();
    res.status(200)
        .cookie('refreshToken',refreshToken,options)
        .json(ApiResponse.successRead({user : sanitizedUser,accessToken},"User Logged In Successfully"));

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

        const user = await User.findById(decodedRefreshToken._id)
            
        if (!user || user?.refreshToken !== refreshToken) {
            // TODO : Redirect to login page
            
            user.refreshToken = null;
            // request.redirect('auth/login');
            return next(ApiError.unauthorizedAccess("User Does Not Exists or Login Again"));
        }

        
        const newAccessToken = await user.generateAccessToken();
        console.log("------------------------------------REFRESH---------------------------");
        console.log("Access Token :",newAccessToken,"\n\n");
        console.log("----------------------------------------------------------------------");
        
        const { password, refreshToken: userRefreshToken, ...sanitizedUser } = user.toObject();

        const options = {
            httpOnly: true,
            secure : process.env.NODE_ENV === 'production',
            sameSite : 'none'
        }
        
        console.log("----------------------------------------------------------------------");
        res.status(200).json(ApiResponse.successRead({user : sanitizedUser ,newAccessToken},"Token Refreshed Successfully"));
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
                  select : {
                    password : 0,
                    refreshToken : 0,
                },
                  new : true,
                }
              ) 
                //Returns the new updated user
            if (!loggedOutUser) {
                return next(ApiError.validationFailed("User not found or already logged out"));
            }


            const options = {
              httpOnly:true,
              secure : process.env.NODE_ENV === "production",
              sameSite : 'none'
            }
            console.log("------------------------------------------------------------------------");
            res.status(200)
            .clearCookie("refreshToken",options)
            .json(ApiResponse.successUpdated(loggedOutUser ,"User Logged Out Successfully"))
    } catch (error) {
        return next(ApiError.dataNotInserted("Unable to logout"));
    }
});

const forgotPassword = asyncHandler(async(req,res,next)=>{
    const {mobileNo} = req.body;
    if(!mobileNo){
        return next(ApiError.validationFailed("Please provide the mobile number"));
    }
    const user = await User.findOne({mobileNo : mobileNo , isUserDeleted : false});
    if(!user)
    {
        return next(ApiError.dataNotFound("User not found"));
    }
    if(!user.email){
        return next(ApiError.dataNotFound("User does not have email address contact admin to reset the password"));
    }
    // Send the email to the user
    const otp = Math.random().toString().slice(-6);
    const otpExpiration = Date.now() + 10 * 60 * 1000;
    const to = user.email;
    const subject = "Password Reset Request";
    const text = "please donot share the otp with unknown person"+otp;
    const html = "<h3>OTP to reset the password is : " + otp + "</h3>";

    try {
        await sendMail(to,subject,text,html);
        user.otp = otp;
        user.otpExpiration = otpExpiration;
        await user.save();
        res.status(201).json(ApiResponse.successCreated(null,"OTP sent successfully"));
    } catch (error) {
        console.log("ujas");
        return next(ApiError.mailNotSent(error.message));
    }
});

const validateOtpAndChangePassword = asyncHandler(async (req, res, next) => {
    const { mobileNo, otp , newPassword } = req.body;
    if (!mobileNo || !otp || !newPassword) {
      return next(ApiError.validationFailed("Please provide the mobile number and OTP and new password"));
    }
    
    const user = await User.findOne({ mobileNo: mobileNo , isUserDeleted : false});
    if (!user) {
      return next(ApiError.dataNotFound("User not found"));
    }

    // Validate OTP
    if(user.otpExpiration < Date.now()){
        return next(ApiError.validationFailed("OTP expired"));
    }
    if (user.otp !== otp) {
      return next(ApiError.validationFailed("Invalid OTP"));
    }
  
    try{
        user.password = newPassword;
        user.otp = null;
        user.otpExpiration = null;
        await user.save();
        res.status(200).json(ApiResponse.successRead({ message: "Password changed successfully" }));
    }
    catch (error) {
      return next(ApiError.dataNotUpdated("Unable to update the password "));
    }
});

export {login , refreshAccessToken , logout , forgotPassword, validateOtpAndChangePassword };