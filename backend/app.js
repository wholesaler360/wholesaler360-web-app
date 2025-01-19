import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { ApiError } from "./utils/api-error-utils.js";
import { ApiResponse } from "./utils/api-Responnse-utils.js";
import { errorHandler } from "./middlewares/errorHandler-middleware.js";
import { createModule } from "./api/sections/module-controller.js";
import { roleRouter } from "./api/roles/role-route.js";
import { userRouter } from "./api/users/user-route.js";
import { productRouter } from "./api/product/product-route.js";
import { taxRouter } from "./api/product/tax/tax-route.js";
import { categoryRouter } from "./api/product-category/product-category-route.js";
import authRouter from "./api/login/login-route.js";
import authMiddleware from "./middlewares/jwt-auth-middleware.js";

const app = express();

// Delay middleware
const addDelay = (ms) => (req, res, next) => {
  setTimeout(() => {
    next();
  }, ms);
};

const delayTime = 3000; // Delay in milliseconds (e.g., 3 seconds)
app.use(addDelay(delayTime));
app.use(express.json());

app.use(
  urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());

app.use("/auth", authRouter);

app.post("/createModule", createModule);

app.use("/product", productRouter);

app.use("/tax", taxRouter);

app.use("/category", categoryRouter);
// Use the authMiddleware for all routes
app.use(authMiddleware);

app.use("/role", roleRouter);

app.use("/user", userRouter);

// catch all undefined routes for authenticated users
app.use("*", (req, res, next) => {
  return next(new ApiError(404, "Route not found"));
});

// Ensure error handling middleware is used after all routes
app.use(errorHandler);

export default app;
