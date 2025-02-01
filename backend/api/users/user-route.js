import { createUser } from "./user-controller.js";
import Router from 'express'
import { upload } from "../../middlewares/multer-middleware.js";
import formatValidator from "../../middlewares/formatValidation-middleware.js";

const userRouter = Router()

userRouter.route('/createUser').post(
    upload([{name : 'avatar', maxCount : 1}]),
    createUser
    )

export { userRouter }