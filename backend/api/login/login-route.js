import {login , refreshAccessToken , logout} from './login-controller.js';
import Router from 'express';
import {upload} from '../../middlewares/multer-middleware.js'

const authRouter = Router();

authRouter.route('/login').post(upload.none(), login);

authRouter.route('/refreshAccessToken').get(refreshAccessToken);

authRouter.route('/logout').post(logout);

export default authRouter;