import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosPost } from "@/constants/api-context";
import { CreateVendor } from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import * as z from "zod";

export const AddVendorContext = createContext({});

const vendorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobileNo: z.string().min(10, "Mobile number must be 10 digits"),
  email: z.string().email("Invalid email address"),
  gstin: z.string().optional(),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Valid pincode is required"),
  country: z.string().min(2, "Country is required"),
  bankName: z.string().min(2, "Bank name is required"),
  accountNumber: z.string().min(9, "Valid account number is required"),
  ifsc: z.string().min(11, "Valid IFSC code is required"),
  accountHolderName: z.string().min(2, "Account holder name is required"),
  payableBalance: z.number().default(0),
  avatar: z
    .any()
    .optional()
    .refine(
      (file) => !file || (file instanceof Blob && file.size <= 5242880),
      "Image must be less than 5MB"
    ),
});

function AddVendorControl({ children }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const createVendor = async (data) => {
    console.log(data);
    try {
      setIsLoading(true);

      // Make API request
      const response = await axiosPost(CreateVendor, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        showNotification.success("Vendor created successfully");
        navigate("/vendors");
      }
    } catch (error) {
      showNotification.error(error.message || "Failed to create vendor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AddVendorContext.Provider
      value={{
        vendorSchema,
        isLoading,
        createVendor,
      }}
    >
      {children}
    </AddVendorContext.Provider>
  );
}

export default AddVendorControl;
