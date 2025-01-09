// middlewares/errorHandler.js
import { ApiError } from '../utils/api-error-utils.js';

const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        // If the error is an instance of ApiError, use the `toResponseObject` method
        console.log("This is instance of ApiError");
        return res.status(err.statusCode).json(err.toResponseObject());
    } else {
        // For unexpected errors, send a generic 500 error
        const genericError = new ApiError(500, "Internal Server Error");
        return res.status(500).json(genericError.toResponseObject());
    }
};

export { errorHandler };
