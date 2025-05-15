import 'dotenv/config';
import { User } from '../users/user-model.js';
import { CompanyDetails } from '../settings/company-settings/company-settings-model.js';
import { ApiError } from '../../utils/api-error-utils.js';
import { ApiResponse } from '../../utils/api-Responnse-utils.js';
import { asyncHandler } from '../../utils/asyncHandler-utils.js';
import  sendMail  from '../../utils/mail-sender-utils.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';


const login = asyncHandler(async(req,res,next)=>{
    // take the values and validate it
    const {mobileNo, password} = req.body;

    if ([mobileNo , password].some((field) => !field?.trim())) {
        return next(ApiError.validationFailed("Please provide all required fields"));
    }
    
    // Checks if the user already exists
    const user = await User.findOne({mobileNo : mobileNo})
    .populate({path : "role" ,select : "-_id -__v -isRoleDeleted -createdAt -updatedAt"})
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
        secure : true,
        sameSite : 'none'
    }

    const companyDetails = await CompanyDetails.findOne({isDeleted : false})
    .select("-_id -__v -createdAt -updatedAt -isDeleted");

    const { password : $password, refreshToken: $userRefreshToken, isRoleDeleted : $isRoleDeleted , isUserDeleted ,...sanitizedUser } = user.toObject();


    res.status(200)
        .cookie('refreshToken',refreshToken,options)
        .json(ApiResponse.successRead({user : sanitizedUser,accessToken,companyDetails},"User Logged In Successfully"));

});

const refreshAccessToken = asyncHandler(async(req,res,next)=>{  
    const {refreshToken} = req.cookies;
    console.log(req.cookies);
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
            user.refreshToken = null;
            await user.save();
            const options = {
                httpOnly:true,
                secure : true,
                sameSite : 'none'
              }
            res.clearCookie('refreshToken',options);
            return next(ApiError.unauthenticatedAccess("User Does Not Exists or Login Again"));
        }

        
        const newAccessToken = await user.generateAccessToken();
        console.log("------------------------------------REFRESH---------------------------");
        console.log("Access Token :",newAccessToken,"\n\n");
        console.log("----------------------------------------------------------------------");
        
        const { password, refreshToken: userRefreshToken, isUserDeleted,...sanitizedUser } = user.toObject();
        console.log("----------------------------------------------------------------------");
        res.status(200).json(ApiResponse.successRead({user : sanitizedUser ,newAccessToken},"Token Refreshed Successfully"));
    } catch (error) {
        const options = {
            httpOnly:true,
            secure : true,
            sameSite : 'none'
        }
        res.clearCookie('refreshToken',options);
        return next(new ApiError(400,error.message + " Invalid Refresh Token Login Again"));
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
              secure : true,
              sameSite : 'none'
            }
            console.log("------------------------------------------------------------------------");
            res.status(200)
            .clearCookie("refreshToken",options)
            .json(ApiResponse.successUpdated(loggedOutUser ,"User Logged Out Successfully"))
    } catch (error) {
        const options = {
            httpOnly:true,
            secure : true,
            sameSite : 'none'
          }
        res.clearCookie('refreshToken',options);
        return next(ApiError.dataNotInserted("Unable to logout"));
    }
});

const forgotPassword = asyncHandler(async(req,res,next)=>{
    const { mobileNo } = req.body;

    if(!mobileNo){
        return next(ApiError.validationFailed("Please provide the mobile number"));
    }

    const user = await User.findOne({ mobileNo : mobileNo, isUserDeleted : false });
    
    if(!user){
        return next(ApiError.dataNotFound("User not found"));
    }

    if(!user.email){
        return next(ApiError.dataNotFound("User does not have email address contact admin to reset the password"));
    }

    // Crypto random OTP generator
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiration = Date.now() + 5 * 60 * 1000;
    const to = user.email;
    const subject = "Password Reset OTP - Wholesaler360";
    const html = ` <!DOCTYPE html>
<html>
<head>
  <title>Verify Your Email - Wholesaler360</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">
        
        <tr>
            <td align="center" style="padding:10px 0; background-color:#3707aa; color:#ffffff;">
              <h1>Wholesaler360</h1>
            </td>
          </tr>
         

          <!-- Body -->
          <tr>
            <td style="padding:40px 30px 20px 30px; text-align:center;">
              <h1 style="font-size:24px; color:#111111; margin-bottom:20px;">Verify Your Email</h1>
              <p style="font-size:16px; color:#555555; line-height:24px; margin:0 0 30px 0;">
               
                Please use the 6-digit verification code below to reset your password:
              </p>
            </td>
          </tr>

          <!-- OTP -->
          <tr>
            <td align="center" style="padding:20px 30px;">
              <table cellpadding="0" cellspacing="0" style="background-color:#3707aa; border-radius:8px;">
                <tr>
                  <td style="padding:16px 40px;">
                    <span style="display:inline-block; font-size:28px; letter-spacing:8px; color:#ffffff; font-weight:bold;">
                      ${otp}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Instruction -->
          <tr>
            <td style="padding:30px 30px 0 30px; text-align:center;">
              <p style="font-size:14px; color:#777777; line-height:22px; margin:0;">
                Enter this code in the website to verify your email address.<br>
                This code will expire in 5 minutes.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:40px 30px 20px 30px; text-align:center;">
                           
              <p style="font-size:12px; color:#aaaaaa; margin-top:20px;">
                &copy; Wholesaler360. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
        user.otp = otp;
        user.otpExpiry = otpExpiration;
        await user.save();
    
        if(!(await sendMail(to, subject, html))){
            return next(ApiError.mailNotSent("Unable to send the mail"));
        }

        res.status(201).json(ApiResponse.successCreated(null, "OTP sent successfully"));
    } catch (error) {
        return next(ApiError.mailNotSent("Something went wrong"));
    }
});


const validateOtpAndChangePassword = asyncHandler(async (req, res, next) => {
    const { mobileNo, otp , newPassword } = req.body;

    if (!mobileNo || !otp || !newPassword) {
      return next(ApiError.validationFailed("Please provide the mobile number, OTP and new password"));
    }
    
    const user = await User.findOne({ mobileNo: mobileNo , isUserDeleted : false});
    if (!user) {
      return next(ApiError.dataNotFound("User not found"));
    }

    // Validate OTP
    if(user.otpExpiry < Date.now()){
        return next(ApiError.validationFailed("OTP expired"));
    }

    if (user.otp !== otp) {
      return next(ApiError.validationFailed("Invalid OTP"));
    }
  
    try{
        user.password = newPassword;
        user.refreshToken = null;
        await user.save();
        const options = {
            httpOnly:true,
            secure : true,
            sameSite : 'none'
          }
        res.clearCookie('refreshToken',options);
        res.status(200).json(ApiResponse.successRead({ message: "Password changed successfully, Please login again" }));
    }
    catch (error) {
      return next(ApiError.dataNotUpdated("Unable to update the password"));
    }   
});

export { login, refreshAccessToken, logout, forgotPassword, validateOtpAndChangePassword };