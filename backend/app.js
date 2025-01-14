import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { ApiError } from './utils/api-error-utils.js';
import { ApiResponse } from './utils/api-Responnse-utils.js';
import { errorHandler } from './middlewares/errorHandler-middleware.js';
import { createModule } from './api/sections/module-controller.js';
import { roleRouter } from './api/roles/role-route.js';
import { userRouter } from './api/users/user-route.js';
import authRouter from './api/login/login-route.js';
import authMiddleware from './middlewares/jwt-auth-middleware.js';

// testing 1


const app = express();

app.use(express.json());

app.use(urlencoded(
            { 
                extended: true,
                limit: '16kb'
            })
    );
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(cookieParser());

app.use('/login', authRouter);

app.post('/createModule', createModule)

// Use the authMiddleware for all routes
app.use(authMiddleware);

app.use('/role', roleRouter);

app.use('/user',userRouter);

// catch all undefined routes for authenticated users
app.use('*', (req, res, next) => {
    return next(new ApiError(404, 'Route not found'));
})

// Ensure error handling middleware is used after all routes
app.use(errorHandler);


export default app;
