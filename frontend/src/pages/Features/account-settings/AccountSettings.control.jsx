import { createContext, useState } from "react";
import { axiosGet, axiosPut, axiosPost } from "@/constants/api-context";
import {
  changeAvatar,
  changePassword,
  fetchAccountDetails,
  updateAccountDetails,
} from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import * as z from "zod";

export const AccountSettingsContext = createContext({});

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobileNo: z.string().min(10, "Mobile number must be 10 digits"),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z
  .object({
    password: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function AccountSettingsController({ children }) {
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await axiosGet(fetchAccountDetails);
      return response.data.value;
    } catch (error) {
      showNotification.error("Failed to fetch profile details");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data) => {
    try {
      setIsLoading(true);
      const response = await axiosPut(updateAccountDetails, data);
      if (response?.data?.success) {
        showNotification.success("Profile updated successfully");
        return response;
      } else {
        showNotification.error(
          response.data.message || "Failed to update profile"
        );
      }
    } catch (error) {
      showNotification.error(error.message || "Failed to update profile");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAvatar = async (formData) => {
    try {
      setIsLoading(true);
      const response = await axiosPut(changeAvatar, formData);
      showNotification.success("Profile image updated successfully");
      return response;
    } catch (error) {
      showNotification.error(error.message || "Failed to update profile image");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (data) => {
    try {
      setIsLoading(true);
      const response = await axiosPut(changePassword, data);
      showNotification.success("Password updated successfully");
      return response;
    } catch (error) {
      showNotification.error(error.message || "Failed to update password");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AccountSettingsContext.Provider
      value={{
        profileSchema,
        passwordSchema,
        isLoading,
        fetchProfile,
        updateProfile,
        updateAvatar,
        updatePassword,
      }}
    >
      {children}
    </AccountSettingsContext.Provider>
  );
}

export { AccountSettingsController };
