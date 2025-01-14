import 'dotenv/config';
import {User} from '../users/user-model.js';
import { ApiError } from '../../utils/api-error-utils.js';
import { ApiResponse } from '../../utils/api-Responnse-utils.js';
import { asyncHandler } from '../../utils/asyncHandler-utils.js';


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
    
    console.log(accessToken);
    console.log(refreshToken);

    // Save the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save();

    const options = {
        httpOnly: true,
        secure : process.env.NODE_ENV === 'production'
    }

    res.status(200)
        .cookie('accessToken',accessToken,options)
        .cookie('refreshToken',refreshToken,options)
        .json(ApiResponse.successRead({accessToken,refreshToken},"User Logged In Successfully"));

});

export {login};