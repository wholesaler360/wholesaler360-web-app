import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosPost } from "@/constants/api-context";
import { CreateCustomer } from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import * as z from "zod";

export const AddCustomerContext = createContext({});

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobileNo: z.string().min(10, "Mobile number must be 10 digits"),
  email: z.string().email("Invalid email address"),
  gstin: z.string().optional(),
  billingAddress: z.object({
    name: z.string().min(2, "Name is required"),
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z.string().min(6, "Valid pincode is required"),
  }),
  shippingAddress: z.object({
    name: z.string().min(2, "Name is required"),
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z.string().min(6, "Valid pincode is required"),
  }),
  bankDetails: z.object({
    accountName: z.string().min(2, "Account name is required"),
    ifscCode: z.string().min(11, "Valid IFSC code is required"),
    accountNo: z.string().min(9, "Valid account number is required"),
    bankName: z.string().min(2, "Bank name is required"),
  }),
  avatar: z.any()
    .optional()
    .refine(
      (file) => !file || (file instanceof Blob && file.size <= 5242880),
      "Image must be less than 5MB"
    ),
});

function AddCustomerControl({ children }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const createCustomer = async (data) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      
      // Append all text fields
      Object.keys(data).forEach((key) => {
        if (key !== 'avatar') {
          if (typeof data[key] === 'object') {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        }
      });

      // Append avatar if exists
      if (data.avatar) {
        formData.append('avatar', data.avatar);
      }

      const response = await axiosPost(CreateCustomer, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        showNotification.success("Customer created successfully");
        navigate("/customers");
      }
    } catch (error) {
      showNotification.error(error.message || "Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AddCustomerContext.Provider
      value={{
        customerSchema,
        isLoading,
        createCustomer,
      }}
    >
      {children}
    </AddCustomerContext.Provider>
  );
}

export default AddCustomerControl;
