import {login} from './login-controller.js';
import Router from 'express';
import {upload} from '../../middlewares/multer-middleware.js'

const authRouter = Router();

authRouter.route('/').post(upload.none(), login);

export default authRouter;