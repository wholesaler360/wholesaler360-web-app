// import {ApiError} from '../utils/api-error-utils.js';
// import {ApiResponse} from '../utils/api-Responnse-utils.js';
// import {asyncHandler } from '../utils/asyncHandler.js';
// import {User} from '../src/users/user-model.js';
// import { requestVerify } from '../utils/convert-array-to-binary.utils.js';

// const authPermissionMiddleware = asyncHandler(async(req,res,next) => {
//     try {
//         const requestType = req.method
//         const requestModule = req.originalUrl.split('/')[1];

//         const {user_id} = req.user_id;
    
//         if(!user_id){
//             return next(ApiError.validationFailed("Used Id is required"));
//         }
    
//         const user = await User.findById(user_id).populate('role');
    
//         if(!user || user.isUserDeleted === true)
//         {
//             return next(ApiError.dataNotFound("User not found"));
//         }
    
//         if (!user.role || user.role.length === 0) {
//             return next(ApiError.unauthorized("User does not have any roles assigned"));
//         }
        
//         for (const element of user.role) {
//             if(element.module === requestModule)
//             {
//                 if(requestVerify(element.permission)===requestType)
//                 {
//                     // Here i am passing the user who has made the request so that if further it is required can be used without database call
//                     req.fetchedUser = user;
//                     return next();
//                 }
//                 else{
//                     return next(ApiError.unauthorized("You don't have permission to access this module"));
//                 }
//             }
//         }
//     } catch (error) {
//         return next(new ApiError(500, error.message));
//     }

// });

// export default authPermissionMiddleware;