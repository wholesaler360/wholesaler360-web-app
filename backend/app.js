import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { ApiError } from './utils/api-error-utils.js';
import { ApiResponse } from './utils/api-Responnse-utils.js';
import { errorHandler } from './middlewares/errorHandler-middleware.js';
import { createModule } from './src/sections/module-controller.js';
import { authRouter } from './middlewares/auth-route.js';
import { roleRouter } from './src/roles/role-route.js';
const app = express();

app.use(express.json());

app.use(urlencoded(
            { 
                extended: true,
                limit: '16kb'
            })
        );
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(cookieParser());


app.use('/customer', authRouter);
app.use('/role', roleRouter);

app.get('/*', (req, res, next) => {
    return next(ApiError.dataNotDeleted(401,"Route not found"));
})

app.post('/createModule' , createModule)
// Ensure error handling middleware is used after all routes
app.use(errorHandler);


export default app;
