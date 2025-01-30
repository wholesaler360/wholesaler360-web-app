import { ApiError } from '../utils/api-error-utils.js';
import { universalValidationSchema } from '../utils/formatValidator-utils.js';
import { asyncHandler } from '../utils/asyncHandler-utils.js';


const formatValidator = asyncHandler(async (req, res, next) => {
    try {
        const validData = await universalValidationSchema.parseAsync(req.body);
        req.body = validData; // Replace body with validated data
        return next();
    } catch (error) {
        if (error.issues) {
            // Pass only the first error message
            return next(ApiError.validationFailed(error.issues[0].message));
        }
        return next(ApiError.validationFailed(error.message));
    }
});

export default formatValidator;