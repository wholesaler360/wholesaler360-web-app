import { createUser } from "./user-controller.js";
import Router from 'express'
import { upload } from "../../middlewares/multer-middleware.js";

const userRouter = Router()

userRouter.route('/createUser').post(
    upload.fields([{name : 'avatar', maxCount : 1}]), 
    createUser
    )

export { userRouter }