import { createUser ,fetchUser, fetchAllUsers, updateUser, updateAvatar,deleteUser} from "./user-controller.js";
import Router from 'express'
import { upload } from "../../middlewares/multer-middleware.js";
import formatValidator from "../../middlewares/formatValidation-middleware.js";

const userRouter = Router()

userRouter.route('/createUser').post(
    upload([{name : 'avatar', maxCount : 1}]),
    createUser
    )

userRouter.route('/fetch/:mobileNo').get(fetchUser)
userRouter.route('/fetchAll').get(fetchAllUsers)

userRouter.route('/update').put(updateUser)
userRouter.route('/updateAvatar').put(
    upload([{name : 'avatar', maxCount : 1}]),
    updateAvatar
    )
    
userRouter.route('/delete').delete(deleteUser)

export { userRouter }