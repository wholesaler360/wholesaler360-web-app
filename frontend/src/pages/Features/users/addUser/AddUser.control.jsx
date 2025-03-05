import { createContext, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosGet, axiosPost } from "@/constants/api-context";
import { CreateUser, FetchAllRoles } from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import * as z from "zod";

export const AddUserContext = createContext({});

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobileNo: z.string().min(10, "Mobile number must be at least 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.string().min(1, "Please select a role"),
  avatar: z
    .any()
    .refine((file) => file instanceof Blob, "Please upload an image")
    .refine((file) => file.size <= 5242880, "Image must be less than 5MB"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function AddUserController({ children }) {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await axiosGet(FetchAllRoles);
      if (response.data.success) {
        setRoles(response.data.value.roles);
      } else {
        throw new Error(response.data.message || "Failed to fetch roles");
      }
    } catch (error) {
      showNotification.error("Failed to fetch roles");
      navigate("/users");
    }
  }, [navigate]);

  const createUser = async (formData) => {
    try {
      const response = await axiosPost(CreateUser, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (response.status === 201) {
        showNotification.success("User created successfully");
        navigate("/users");
      } else {
        throw new Error(response.data.message || "Failed to create user");
      }
    } catch (error) {
      showNotification.error(error.message || "Failed to create user");
      throw error;
    }
  };

  return (
    <AddUserContext.Provider
      value={{
        userSchema,
        createUser,
        roles,
        fetchRoles,
      }}
    >
      {children}
    </AddUserContext.Provider>
  );
}
