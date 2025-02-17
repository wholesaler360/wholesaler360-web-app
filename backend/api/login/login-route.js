import { login, refreshAccessToken, logout, forgotPassword, validateOtpAndChangePassword } from './login-controller.js';
import Router from 'express';
import { upload } from '../../middlewares/multer-middleware.js';
import { ApiError } from '../../utils/api-error-utils.js';
const authRouter = Router();

authRouter.route('/login').post(upload(), login);

authRouter.route('/refreshAccessToken').get(refreshAccessToken);

authRouter.route('/logout').post(logout);

authRouter.route('/forgotPassword').post(forgotPassword);

authRouter.route('/validate').post(validateOtpAndChangePassword);

// Handle any other routes not mentioned
authRouter.use('*', (req, res, next) => {
  return next(new ApiError(404,'Route not found'));
});

export default authRouter;