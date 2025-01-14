import { ApiError } from '../utils/api-error-utils.js';
import 'dotenv/config';

const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        // If the error is an instance of ApiError, use the `toResponseObject` method
        return res.status(err.statusCode).json({
            ...err.toResponseObject(),
            message: err.message,
            stack: err.stack // Include the stack trace in the response
        });
    } else {
        // For unexpected errors, send a generic 500 error with the error message and stack trace
        const genericError = new ApiError(500, process.env.NODE_ENV === "development" 
            ? err.message || "Internal Server Error" 
            : "Internal Server Error"
        );
        console.error(err.stack); // Log the stack trace for debugging
        return res.status(500).json({
            message: genericError.message,
            stack: err.stack // Include the stack trace in the response
        });
    }
};

export { errorHandler };
