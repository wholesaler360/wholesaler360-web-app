import { createContext, useState, useCallback } from "react";
import { axiosPost, axiosPut, axiosGet } from "@/constants/api-context";
import {
  FetchCustomer,
  UpdateCustomer,
  UpdateCustomerImage,
} from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import { useNavigate } from "react-router-dom";
import * as z from "zod";

export const UpdateCustomerContext = createContext({});
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobileNo: z.string().min(10, "Mobile number must be 10 digits"),
  newMobileNo: z.string().min(10, "Mobile number must be 10 digits"),
  email: z.string().email("Invalid email address"),
  gstin: z
    .string()
    .regex(gstinRegex, "Invalid GSTIN format")
    .optional()
    .or(z.literal(null))
    .or(z.literal("")),
  billingAddress: z.object({
    addressLine1: z.string().min(5, "Address is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z.string().min(6, "Valid pincode is required"),
  }),
  shippingAddress: z.object({
    addressLine1: z.string().min(5, "Address is required"),
    addressLine2: z.string().optional(),
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
});

function UpdateCustomerController({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCustomerDetails = useCallback(async (mobileNo) => {
    try {
      setIsLoading(true);
      const response = await axiosGet(`${FetchCustomer}/${mobileNo}`);
      return response.data.value;
    } catch (error) {
      showNotification.error("Failed to fetch customer details");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCustomer = async (data) => {
    try {
      setIsLoading(true);
      const response = await axiosPut(UpdateCustomer, data);
      console.log(response);
      if (response?.data?.success) {
        showNotification.success("Customer updated successfully");
        navigate("/customers");
      } else {
        showNotification.error(response.message || "Failed to update customer");
      }
      return response;
    } catch (error) {
      showNotification.error(error.message || "Failed to update customer");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCustomerImage = async (formData) => {
    try {
      setIsLoading(true);
      const response = await axiosPut(UpdateCustomerImage, formData);

      if (response.data.success) {
        showNotification.success("Customer image updated successfully");
        return { success: true, data: response.data };
      }

      throw new Error(response.data?.message || "Failed to update image");
    } catch (error) {
      console.error("Image upload error:", error);
      showNotification.error(
        error.message || "Failed to update customer image"
      );
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UpdateCustomerContext.Provider
      value={{
        customerSchema,
        isLoading,
        fetchCustomerDetails,
        updateCustomer,
        updateCustomerImage,
      }}
    >
      {children}
    </UpdateCustomerContext.Provider>
  );
}

export default UpdateCustomerController;
