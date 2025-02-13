import { createContext, useState, useCallback } from "react";
import { axiosPost, axiosPut } from "@/constants/api-context";
import {
  FetchVendor,
  UpdateVendor,
  UpdateVendorAvatar,
} from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import { useNavigate } from "react-router-dom";
import * as z from "zod";

export const UpdateVendorContext = createContext({});

const vendorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobileNo: z.string().min(10, "Mobile number must be 10 digits"),
  newMobileNo: z.string().min(10, "Mobile number must be 10 digits"),
  email: z.string().email("Invalid email address"),
  gstin: z.string().optional().or(z.literal(null)).or(z.literal("")),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Valid pincode is required"),
  country: z.string().min(2, "Country is required"),
  accountHolderName: z.string().min(2, "Account holder name is required"),
  ifsc: z.string().min(11, "Valid IFSC code is required"),
  bankName: z.string().min(2, "Bank name is required"),
  accountNumber: z.string().min(9, "Valid account number is required"),
});

function UpdateVendorController({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchVendorDetails = useCallback(async (mobileNo) => {
    try {
      setIsLoading(true);
      const response = await axiosPost(FetchVendor, {
        mobileNo: mobileNo,
      });
      return response.data.value;
    } catch (error) {
      showNotification.error("Failed to fetch vendor details");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateVendor = async (data) => {
    try {
      setIsLoading(true);
      const response = await axiosPut(UpdateVendor, data);
      showNotification.success("Vendor updated successfully");
      navigate("/vendors");
      return response;
    } catch (error) {
      showNotification.error(error.message || "Failed to update vendor");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateVendorAvatar = async (formData) => {
    try {
      setIsLoading(true);
      const response = await axiosPut(UpdateVendorAvatar, formData);

      if (response.status === 200) {
        showNotification.success("Vendor image updated successfully");
        return { success: true, data: response.data };
      }

      throw new Error(response.data?.message || "Failed to update image");
    } catch (error) {
      console.error("Image upload error:", error);
      showNotification.error(error.message || "Failed to update vendor image");
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UpdateVendorContext.Provider
      value={{
        vendorSchema,
        isLoading,
        fetchVendorDetails,
        updateVendor,
        updateVendorAvatar,
      }}
    >
      {children}
    </UpdateVendorContext.Provider>
  );
}

export default UpdateVendorController;
