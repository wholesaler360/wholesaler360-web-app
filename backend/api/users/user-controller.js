import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { User } from "./user-model.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import { Role } from "../roles/role-model.js";
import { uploadFile,deleteFromLocalPath } from "../../utils/cloudinary-utils.js";


const createUser = asyncHandler(async(req,res,next)=>{
    // res.status(200).send("Jay shree ram")

    // take the values and validate it 
    const {name,email,mobileNo,password,confirmPassword,role} = req.body;
        console.log(role);

    if ([name, email , mobileNo , password, confirmPassword,role ].some((field) => !field?.trim()==="")) {
        return next(ApiError.validationFailed("Please provide all required fields"));
    }

    // Checks if the user already exists
    const existingUser = await User.findOne({
        $or: [{ email }, { mobileNo }],
      })

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

    // User created
    console.log(avatar.url);

    try {
        const userCreated = await User.create({
            name ,
            email ,
            mobileNo ,
            password ,
            avatar : avatar.url,
            role : assignedRoleId._id
        });

        res.status(201).json(ApiResponse.successCreated(userCreated,"User Created Successfully"))

    } catch (error) {
        deleteFromLocalPath(req.files?.avatar[0]?.path);
        return next(ApiError.dataNotInserted("User not created"));
    }


});

    


const updateUser = asyncHandler(async(req,res,next)=>{
    
})
const deleteUser = asyncHandler(async(req,res,next)=>{

})
export {createUser}