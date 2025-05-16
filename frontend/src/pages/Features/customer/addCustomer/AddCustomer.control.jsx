import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosPost } from "@/constants/api-context";
import { CreateCustomer } from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import * as z from "zod";

export const AddCustomerContext = createContext({});

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobileNo: z.string().min(10, "Valid mobile number required"),
  email: z.string().email("Valid email required"),
  gstin: z.string().optional(),
  billingAddress: z.object({
    addressLine1: z.string().min(1, "Address is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().min(6, "Valid pincode required"),
    country: z.string().min(1, "Country is required"),
  }),
  shippingAddress: z.object({
    addressLine1: z.string().min(1, "Address is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().min(6, "Valid pincode required"),
    country: z.string().min(1, "Country is required"),
  }),
  bankDetails: z.object({
    accountName: z.string().min(1, "Account name required"),
    ifscCode: z.string().min(1, "IFSC code required"),
    accountNo: z.string().min(1, "Account number required"),
    bankName: z.string().min(1, "Bank name required"),
  }),
  avatar: z.any().optional(),
});

function AddCustomerControl({ children }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const createCustomer = async (data) => {
    setIsLoading(true);
    try {
      console.log("Attempting to create customer with data:", data);

      if (!data) {
        throw new Error("No data provided");
      }

      const response = await axiosPost(CreateCustomer, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("API Response:", response);

      if (response?.data) {
        showNotification.success("Customer created successfully");
        navigate("/customers");
        return response.data;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Create customer error:", error);
      showNotification.error(
        error.response?.data?.message || "Failed to create customer"
      );
      throw error;
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
