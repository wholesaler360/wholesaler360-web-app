import { createContext, useCallback, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosGet, axiosPut } from "@/constants/api-context";
import {
  UpdateUser,
  UpdateUserAvatar,
  FetchAllRoles,
  FetchUser,
} from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import * as z from "zod";

export const UpdateUserContext = createContext({});

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobileNo: z.string().min(1, "Mobile number is required"),
  newMobileNo: z.string().min(1, "New mobile number is required"),
  role: z.string().min(1, "Please select a role"),
});

export function UpdateUserController({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Add function to fetch user details by mobile number
  const fetchUserDetails = useCallback(async (mobileNo) => {
    try {
      setIsLoading(true);
      const response = await axiosGet(FetchUser(mobileNo));

      if (response?.data?.success) {
        return response.data.value;
      }
      throw new Error(
        response?.data?.message || "Failed to fetch user details"
      );
    } catch (error) {
      console.error("Error fetching user details:", error);
      showNotification.error(
        error?.response?.data?.message || "Failed to fetch user details"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to handle initial user data
  useEffect(() => {
    const initializeUserData = async () => {
      try {
        if (location.state?.userData) {
          // If userData is passed through location state
          const mobileNo = location.state.userData.mobileNo;
          // Fetch fresh user data from API
          const freshUserData = await fetchUserDetails(mobileNo);
          setUserData(freshUserData);
        } else if (location.state?.mobileNo) {
          // If only mobileNo is passed
          const freshUserData = await fetchUserDetails(location.state.mobileNo);
          setUserData(freshUserData);
        } else {
          showNotification.error("No user data provided");
          navigate("/users");
        }
      } catch (error) {
        console.error("Failed to initialize user data:", error);
        navigate("/users");
      } finally {
        setIsInitialLoading(false);
      }
    };

    initializeUserData();
  }, [location.state, navigate, fetchUserDetails]);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await axiosGet(FetchAllRoles);
      if (response && response.data && response.data.success) {
        setRoles(response.data.value.roles);
      } else {
        throw new Error("Failed to fetch roles");
      }
    } catch (error) {
      showNotification.error(error.response?.data?.message || "Failed to fetch roles");
    }
  }, []);

  const updateUserDetails = async (data) => {
    try {
      setIsLoading(true);
      // Format the data to match backend requirements
      const payload = {
        name: data.name.trim().toLowerCase(),
        mobileNo: data.mobileNo,
        newMobileNo: data.newMobileNo || data.mobileNo,
        email: data.email,
        role: data.role,
      };

      const response = await axiosPut(UpdateUser, payload);

      if (response?.data?.success) {
        showNotification.success("User updated successfully");
        return response.data.value;
      }
      throw new Error(response?.data?.message || "Failed to update user");
    } catch (error) {
      console.error("Error updating user:", error);
      showNotification.error(
        error?.response?.data?.message || "Failed to update user"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserAvatar = async (formData) => {
    try {
      setIsLoading(true);

      const response = await axiosPut(UpdateUserAvatar, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response?.data?.success) {
        showNotification.success("Avatar updated successfully");
        return response.data.value;
      }
      throw new Error(response?.data?.message || "Failed to update avatar");
    } catch (error) {
      console.error("Avatar update error:", error);
      showNotification.error(
        error?.response?.data?.message || "Failed to update avatar"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UpdateUserContext.Provider
      value={{
        userSchema,
        roles,
        isLoading,
        isInitialLoading,
        fetchRoles,
        fetchUserDetails,
        updateUserDetails,
        updateUserAvatar,
        userData,
        setUserData,
      }}
    >
      {children}
    </UpdateUserContext.Provider>
  );
}

export default UpdateUserController;
