import { createContext, useState } from "react";
import { axiosGet, axiosPut } from "@/constants/api-context";
import {
  fetchAppEmailSettings,
  updateAppEmailSettings,
} from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import * as z from "zod";

export const AppSettingsContext = createContext({});

const emailSettingsSchema = z.object({
  email: z.string().email("Invalid email address"),
  credential: z.string().min(1, "Credential is required"),
  smtpHost: z.string().min(1, "SMTP host is required"),
  smtpPort: z.coerce
    .number()
    .int()
    .positive("SMTP port must be a positive integer"),
});

export function AppSettingsController({ children }) {
  const [isLoading, setIsLoading] = useState(false);

  const fetchEmailSettings = async () => {
    try {
      setIsLoading(true);
      const response = await axiosGet(fetchAppEmailSettings);

      if (response.data.success) {
        return response.data.value;
      } else {
        showNotification.error("Failed to fetch email settings");
        return null;
      }
    } catch (error) {
      showNotification.error(error.response?.data?.message || "Failed to fetch email settings");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmailSettings = async (data) => {
    try {
      setIsLoading(true);
      const response = await axiosPut(updateAppEmailSettings, data);

      if (response.data.success) {
        showNotification.success("Email settings updated successfully");
        return response.data.value;
      } else {
        showNotification.error("Failed to update email settings");
        return null;
      }
    } catch (error) {
      showNotification.error(error.response?.data?.message || "Failed to update email settings");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppSettingsContext.Provider
      value={{
        emailSettingsSchema,
        isLoading,
        fetchEmailSettings,
        updateEmailSettings,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}
