import { createContext, useCallback, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosGet, axiosPost, axiosPut } from "@/constants/api-context";
import { UpdateUser, UpdateUserAvatar, FetchAllRoles } from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import * as z from "zod";

export const UpdateUserContext = createContext({});

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobileNo: z.string().min(10, "Mobile number must be at least 10 digits"),
  newMobileNo: z.string().min(10, "Mobile number must be at least 10 digits"),
  role: z.string().min(1, "Please select a role"),
});

export function UpdateUserController({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  // Add useEffect to handle initial user data
  useEffect(() => {
    if (location.state?.userData) {
      setUserData(location.state.userData);
    } else {
      showNotification.error("No user data provided");
      navigate("/users");
    }
  }, [location.state, navigate]);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await axiosGet(FetchAllRoles);
      if (response.data.success) {
        setRoles(response.data.value.roles);
      }
    } catch (error) {
      showNotification.error("Failed to fetch roles");
      navigate("/users");
    }
  }, [navigate]);

  const updateUserDetails = async (data) => {
    try {
      setIsLoading(true);
      const updatedData = {
        ...data,
        email: userData.email,
      };

      const response = await axiosPut(UpdateUser, updatedData);
      
      if (response.data.success) {
        showNotification.success("User updated successfully");
        return response.data.value;
      }
      throw new Error(response.data.message || "Failed to update user");
    } catch (error) {
      showNotification.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserAvatar = async (mobileNo, avatarFile) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("mobileNo", mobileNo);
      formData.append("avatar", avatarFile);

      const response = await axiosPut(UpdateUserAvatar, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        showNotification.success("Avatar updated successfully");
        return response.data.value;
      }
      throw new Error(response.data.message || "Failed to update avatar");
    } catch (error) {
      showNotification.error(error.message);
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
        fetchRoles,
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
