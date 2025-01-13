import {login} from './login-controller.js';
import Router from 'express';

const authRouter = Router();

authRouter.route('/').post(login);

export default authRouter;