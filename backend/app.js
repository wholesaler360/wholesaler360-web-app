import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { ApiError } from "./utils/api-error-utils.js";
import { errorHandler } from "./middlewares/errorHandler-middleware.js";
import { createModule } from "./api/sections/module-controller.js";
import { roleRouter } from "./api/roles/role-route.js";
import { userRouter } from "./api/users/user-route.js";
import { productRouter } from "./api/product/product-route.js";
import { taxRouter } from "./api/product/tax/tax-route.js";
import { categoryRouter } from "./api/product-category/product-category-route.js";
import { customerRouter } from "./api/customer/customer-route.js";
import authRouter from "./api/login/login-route.js";
import authMiddleware from "./middlewares/jwt-auth-middleware.js";
import formatValidator from "./middlewares/formatValidation-middleware.js";
import seederRouter from "./utils/seeder-utils.js";
import { vendorRouter } from "./api/vendors/vendor-route.js";
import { ledgerRouter } from "./api/ledger/ledger-route.js";


// TODO : Validation like email, mobile number etc..,


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

app.use(async(req,res,next)=>{
    if(req.headers['content-type']?.startsWith('multipart/form-data')){
        console.log("inside the multipart form data");
        return next();
    }
    console.log("inside the json data");
    formatValidator(req,res,next);
})

app.use('/auth', authRouter);


app.post('/createModule', createModule)

app.use('/seed', seederRouter);

// Use the authMiddleware for all routes
app.use(authMiddleware);

app.use('/role', roleRouter);
app.use("/user", userRouter);


app.use("/tax", taxRouter);
app.use('/category', categoryRouter);
app.use('/product', productRouter)

app.use("/customer", customerRouter);

app.use('/vendor', vendorRouter);
app.use('/ledger', ledgerRouter);


// catch all undefined routes for authenticated users
app.use('*', (req, res, next) => {
    return next(new ApiError(404, 'Route not found'));
})

// Ensure error handling middleware is used after all routes
app.use(errorHandler);


export default app;
