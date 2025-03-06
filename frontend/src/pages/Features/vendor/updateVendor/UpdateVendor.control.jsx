import { createContext, useState, useCallback } from "react";
import { axiosGet, axiosPut } from "@/constants/api-context";
import {
  FetchVendor,
  UpdateVendor,
  UpdateVendorAvatar,
} from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import { useNavigate } from "react-router-dom";

export const UpdateVendorContext = createContext({});

function UpdateVendorController({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchVendorDetails = useCallback(async (mobileNo) => {
    try {
      setIsLoading(true);
      const response = await axiosGet(`${FetchVendor}/${mobileNo}`);
      return response.data.value;
    } catch (error) {
      showNotification.error("Failed to fetch vendor details");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateVendor = async (data) => {
    console.log("updateVendor API function called with:", data);
    try {
      setIsLoading(true);
      console.log("Making PUT request to:", UpdateVendor);
      const response = await axiosPut(UpdateVendor, data);
      console.log("API response:", response);
      showNotification.success("Vendor updated successfully");
      navigate("/vendors");
      return response;
    } catch (error) {
      console.error("API error:", error);
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
