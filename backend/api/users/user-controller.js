import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { User } from "./user-model.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import { Role } from "../roles/role-model.js";
import { uploadFile, deleteFromLocalPath, deleteFromCloudinary } from "../../utils/cloudinary-utils.js";


const createUser = asyncHandler(async(req,res,next)=>{

    // take the values and validate it 
    const {name, email, mobileNo, password, confirmPassword, role} = req.body;

    if ([name, email, mobileNo, password, confirmPassword, role ].some((field) => !field?.trim())) {
        return next(ApiError.validationFailed("Please provide all required fields"));
    }

    // Checks if the user already exists
    const existingUser = await User.findOne({
        $or: [{ email }, { mobileNo }],
      isUserDeleted : false})

    if(existingUser)
    {
        deleteFromLocalPath(req.files?.avatar[0]?.path);
        return next(ApiError.valueAlreadyExists("User Already Exists"))
    }
    
    // Checks if the password and confirm password are same
    if(confirmPassword !== password)
    {
        deleteFromLocalPath(req.files?.avatar[0]?.path);
        return next(ApiError.validationFailed("confirm password does not matchs the password"))
    }

    // Checks if role exists or not and trim and convert to lower case
    role.trim().toLowerCase();

    const assignedRoleId = await Role.findOne({name : role})
    if(!assignedRoleId)
    {
        deleteFromLocalPath(req.files?.avatar[0]?.path);
        return next(ApiError.validationFailed("Please assign the role"))
    }

    // Checks if the avatar is uploaded or not
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if(!avatarLocalPath)
    {
        return next(ApiError.validationFailed("Avatar is required"));
    }

    // Upload the avatar to cloudinary
    const avatar = await uploadFile(avatarLocalPath);

    try {
        const userCreated = await User.create({
            name ,
            email ,
            mobileNo ,
            password ,
            avatar : avatar,
            role : assignedRoleId._id
        });

        res.status(201).json(ApiResponse.successCreated(userCreated, "User Created Successfully"))

    } catch (error) {
        deleteFromLocalPath(req.files?.avatar[0]?.path);
        return next(ApiError.dataNotInserted("User not created"));
    }
});

const updateUser = asyncHandler(async(req,res,next)=>{
    console.log("-----------------Edit User details-----------------");
    
    let name = req.body?.name?.trim().toLowerCase();
    let mobileNo = req.body?.mobileNo;
    let newMobileNo = req.body?.newMobileNo || mobileNo;
    let email = req.body?.email;
    if(!name || !mobileNo || !email)
    {
        return next(ApiError.validationFailed("Please provide the name and mobile number and email"));
    }

    const user = await User.findOne({mobileNo : mobileNo, isUserDeleted : false})
    .populate({path :'role', select : '-_id name'})
    .select('-password -refreshToken -otp -otpExpiry -isUserDeleted -createdAt -updatedAt -__v');
    if(!user){
        return next(ApiError.dataNotFound("User not found"));
    }
    if(user.role.name === 'super admin'){
        return next(ApiError.validationFailed("Super Admin cannot be updated"));
    }
    
    try {
        const condition = [];
        if(newMobileNo !== mobileNo){
            condition.push({mobileNo : newMobileNo});
        }
        if(user.email !== email){
            condition.push({email : email});
        }
        if(condition.length > 0){
            const existingUser = await User.countDocuments({$or : condition , isUserDeleted : false});
            if(existingUser)
            {
                return next(ApiError.validationFailed("Mobile number or email already exists"));
            }
        }

        user.name = name;
        user.mobileNo = newMobileNo;
        user.email = email;
        await user.save();

        res.status(200).json(ApiResponse.successUpdated(user,"User updated successfully"));
        console.log("-----------------Profile Updated Successfully-----------------");
    } catch (error) {
        console.log(error);
        return next(ApiError.dataNotUpdated("Unable to update the profile"));
    }
    
})

const deleteUser = asyncHandler(async(req,res,next)=>{
    console.log("-----------------Delete User-----------------");
    const {mobileNo} = req.body;
    if(!mobileNo)
    {
        return next(ApiError.validationFailed("Please provide the mobile number"));
    }
    try {
        const user = await User.findOne({mobileNo : mobileNo, isUserDeleted:false})
        .populate({path :'role', select : '-_id name'})
        .select('-password -refreshToken -otp -otpExpiry -name -mobileNo -email -createdAt -updatedAt -__v');
        if(!user)
        {
            return next(ApiError.dataNotFound("User does not exists"));
        }
        if(user.role.name === 'super admin'){
            return next(ApiError.validationFailed("Super Admin cannot be deleted"));
        }
        user.isUserDeleted = true;
        await user.save();
        res.status(204).json(ApiResponse.successDeleted("User deleted successfully"));
        console.log("-----------------User Deleted Successfully-----------------");
    } catch (error) {
        console.log("Error deleting the user: ", error);
        return next(ApiError.dataNotDeleted("User not deleted"));
    }
})

const fetchUser = asyncHandler(async(req,res,next)=>{
    const {mobileNo} = req.body;
    if(!mobileNo)
    {
        return next(ApiError.validationFailed("Please provide the mobile number"));
    }
    try {
        const user = await User.findOne({mobileNo : mobileNo, isUserDeleted:false})
        .populate({path :'role', select : '-_id name'})
        .select('-password -refreshToken -otp -otpExpiry -isUserDeleted -createdAt -updatedAt -__v');
        if(!user)
        {
            return next(ApiError.dataNotFound("User not found"));
        }
        res.status(200).json(ApiResponse.successRead(user,"User fetched successfully"));
    } catch (error) {
        console.log("Error fetching the user: ", error);
        return next(ApiError.dataNotFound("User not found"));
    }
})

const fetchAllUsers = asyncHandler(async(req,res,next)=>{
    const users = await User.aggregate([
        {
            $match : {isUserDeleted : false}
        },
        {
            $lookup : {
                from : "roles",
                localField : "role",
                foreignField : "_id",
                as : "role"
            }
        },
        {
            $unwind : "$role"
        },
        {
            $project : {
                _id : 0,
                name : 1,
                email : 1,
                mobileNo : 1,
                role : "$role.name",
                avatar : 1
            }
        }
    ])
    if(users.length === 0)
    {
        return res.status(200).json(ApiResponse.successRead([],"No users found"));
    }
    res.status(200).json(ApiResponse.successRead(users,"Users fetched successfully"));
})

const updateAvatar = asyncHandler(async(req,res,next)=>{
    console.log("-----------------Change User Avatar -----------------");
    const mobileNo = req.body.mobileNo;
    const avatar = req.files?.avatar?.[0]?.path;
    try{   
        if(!avatar)
        {
            return next(ApiError.validationFailed("Please provide the avatar"));
        }
        const user = await User.findOne({mobileNo : mobileNo , isUserDeleted : false}).select({avatar : 1});
        if(!user)
        {
            return next(ApiError.dataNotFound("User not found"));
        }
        const url = await uploadFile(avatar);
        const oldUrl = user.avatar;
        user.avatar = url;
        await user.save();
        if(oldUrl)
        {
            await deleteFromCloudinary(oldUrl);
        }
        res.status(200).json(ApiResponse.successUpdated( user,"Avatar updated successfully"));
        console.log("-----------------Avatar Updated Successfully-----------------");
    }
    catch(error)
    {
        console.log("Error updating the avatar:", error);
        return next(ApiError.dataNotUpdated("Unable to update the avatar"));
    }
    finally{
        deleteFromLocalPath(avatar);
    }
});

const changePassword = asyncHandler(async(req,res,next)=>{
    
})
export {createUser, fetchUser, fetchAllUsers, updateUser, updateAvatar,deleteUser}