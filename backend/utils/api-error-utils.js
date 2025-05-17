class ApiError extends Error {
    
    constructor(statusCode, message = "Something went wrong", data = null, errors = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.errors = errors;
        this.success = false;

        // Not to emit stack trace in production
        if (process.env.NODE_ENV === "development") {
            if (stack) {
                this.stack = stack;
            } else {
                Error.captureStackTrace(this, this.constructor);
            }
        } else {
            this.stack = "";
        }
        
        
    }

    /**
     * Generate a standardized error response object
     * @returns {Object} - Error response object
     */
    toResponseObject() {
        return {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            data: this.data,
            errors: this.errors,
        };
    }

    // Static methods for specific error scenarios

    /**
     * Data Not Found Error
     * @param {string} message - Custom message (optional)
     * @param {Object|null} data - Additional data (optional)
     * @returns {ApiError}
     */
    static dataNotFound(message = "Data not found", data = null) {
        return new ApiError(404, message, data);
    }

    /**
     * Data Not Inserted Error
     * @param {string} message - Custom message (optional)
     * @param {Object|null} data - Additional data (optional)
     * @returns {ApiError}
     */
    static dataNotInserted(message = "Data not inserted", data = null) {
        return new ApiError(400, message, data);
    }

    /**
     * Data Not Updated Error
     * @param {string} message - Custom message (optional)
     * @param {Object|null} data - Additional data (optional)
     * @returns {ApiError}
     */
    static dataNotUpdated(message = "Data not updated", data = null) {
        return new ApiError(400, message, data);
    }

    /**
     * Data Not Deleted Error
     * @param {string} message - Custom message (optional)
     * @param {Object|null} data - Additional data (optional)
     * @returns {ApiError}
     */
    static dataNotDeleted(message = "Data not deleted", data = null) {
        return new ApiError(400, message, data);
    }

    /**
     * Unauthorized Access Error
     * @param {string} message - Custom message (optional)
     * @returns {ApiError}
     */
    static unauthorizedAccess(message = "Unauthorized access") {
        return new ApiError(403, message);
    }

    static unauthenticatedAccess(message = "unauthenticated access") {
        return new ApiError(401, message);
    }

    /**
     * Incorrect Password Error
     * @param {string} message - Custom message (optional)
     * @returns {ApiError}
     */
    static incorrectPassword(message = "Incorrect password") {
        return new ApiError(401, message);
    }

    /**
     * Validation Failed Error
     * @param {Array} errors - List of validation errors
     * @param {string} message - Custom message (optional)
     * @returns {ApiError}
     */
    static validationFailed(message = "Validation failed",errors = []) {
        return new ApiError(422, message, null, errors);
    }
    
    // Conflict with the other data
    static valueAlreadyExists(message = "Value already exists",errors = []) {
        return new ApiError(409, message, null, errors);
    }

    static tokenNotFound(message="Token not found",errors = []) {
        return new ApiError(404,message,errors)
    }

    static imageNotGenerated(message="image not generated", errors = []) {
        return new ApiError(417,message,errors)
    }

    static mailNotSent(message = "mail not sent", data = null) {
        return new ApiError(400, message, data);
    }
}

export { ApiError };
