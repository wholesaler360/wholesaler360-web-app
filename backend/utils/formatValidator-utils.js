import { z } from "zod";


// RegEx Patterns
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const mobileRegex = /^\+\d+(?:-\d+)*\s\d+$/;
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
// const pincodeRegex = /^[1-9][0-9]{5}$/;
const pincodeRegex = /^.*$/;
const upiId = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z0-9]{2,64}$/;


const universalValidationSchema = z.object({
    // Password related fields
    password: z.string().regex(passwordRegex, "Password must be 8+ characters with uppercase, lowercase, number & symbol.").optional(),
    newPassword: z.string().regex(passwordRegex, "Password must be 8+ characters with uppercase, lowercase, number & symbol.").optional(),
    confirmPassword: z.string().optional(),

    // UPI ID
    upiId: z.string().regex(upiId, "Invalid UPI ID").optional(),

    // Number formats
    mobileNo: z.string().regex(mobileRegex, "Invalid mobile number").optional(),
    newMobileNo: z.string().regex(mobileRegex, "Invalid mobile number").optional(),
    gstin: z.string().regex(gstinRegex, "Invalid GSTIN format").optional().or(z.literal(null))
    .or(z.literal("")),
    pincode: z.string().regex(pincodeRegex, "Invalid pincode").optional(),

    billingAddress: z.object({
        pincode: z.string().regex(/^.*$/, "Invalid billing pincode").optional(),
    }).passthrough().optional(),

    shippingAddress: z.object({
        pincode: z.string().regex(/^.*$/, "Invalid shipping pincode").optional(),
    }).passthrough().optional(),
      
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
}).passthrough().refine((data) => {   // This ensures all fields are passed through, even if not defined in schema
    if (data.newPassword && data.confirmPassword) {
        return data.newPassword === data.confirmPassword;
    }
    return true;
}, {
    message: "New password and confirm password do not match",
    path: ["confirmPassword"]
}); 


export { universalValidationSchema };