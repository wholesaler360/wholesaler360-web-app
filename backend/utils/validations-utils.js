import { z } from "zod";
import { ApiError } from '../utils/api-error-utils.js';

// RegEx Patterns
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const mobileRegex = /^[6-9]\d{9}$/;
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const pincodeRegex = /^[1-9][0-9]{5}$/;


const universalValidationSchema = z.object({
    // Password related fields
    password: z.string().regex(passwordRegex, "Password must be 8+ characters with uppercase, lowercase, number & symbol.").optional(),
    newPassword: z.string().regex(passwordRegex, "Password must be 8+ characters with uppercase, lowercase, number & symbol.").optional(),
    confirmPassword: z.string().optional(),

    // Number formats
    mobileNo: z.string().regex(mobileRegex, "Invalid mobile number").optional(),
    newMobileNo: z.string().regex(mobileRegex, "Invalid mobile number").optional(),
    gstin: z.string().regex(gstinRegex, "Invalid GSTIN format").optional(),
    pincode: z.string().regex(pincodeRegex, "Invalid pincode").optional(),
    email: z.string().email("Invalid email format").min(5, "Invalid email format").optional(),

    // Names
    name: z.string().transform(val => val?.toLowerCase().trim()).optional(),
    newName: z.string().transform(val => val?.toLowerCase().trim()).optional(),

    // Percentage
    percent: z.number().min(0).max(100).optional(),

    // Trimmed lowercase fields
    categoryName: z.string().transform(val => val?.toLowerCase().trim()).optional(),
    discountType: z.string().transform(val => val?.toLowerCase().trim()).optional(),
    transactionType: z.string().transform(val => val?.toLowerCase().trim()).optional(),
    paymentMode: z.string().transform(val => val?.toLowerCase().trim()).optional(),
    taxName: z.string().transform(val => val?.toLowerCase().trim()).optional(),
}).refine((data) => {
    if (data.newPassword && data.confirmPassword) {
        return data.newPassword === data.confirmPassword;
    }
    return true;
}, {
    message: "New password and confirm password do not match",
    path: ["confirmPassword"]
}).passthrough(); // This ensures all fields are passed through, even if not defined in schema



export const validateUniversal = async (req, res, next) => {
    try {
        const validData = await universalValidationSchema.parseAsync(req.body);
        req.body = validData; // Replace body with validated data
        next();
    } catch (error) {
        if (error.issues) {
            // Pass only the first error message
            next(ApiError.validationFailed(error.issues[0].message));
            return;
        }
        next(ApiError.validationFailed(error.message));
    }
};

