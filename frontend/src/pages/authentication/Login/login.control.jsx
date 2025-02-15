import React, { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { axiosPost } from "@/constants/api-context";
import { setAuthData } from "@/lib/authUtils";
import { showNotification } from "@/core/toaster/toast";
import { LoginApi } from "@/constants/apiEndPoints";
import { useAuth } from "@/context/auth-context";

const LoginContext = createContext({
  submitLoginForm: async (data) => {},
});

function LoginController({ children }) {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const submitLoginForm = async (data) => {
    try {
      const formData = {
        mobileNo: data.mobile,
        password: data.password,
      };

      const response = await axiosPost(LoginApi, formData);

      if (response?.status === 200 && response?.data?.success) {
        // Store auth data in localStorage
        setAuthData(response.data);

        // Update auth context
        setUser(response.data.value.user);

        showNotification.success(response.data.message || "Login successful");
        navigate("/");
      } else {
        showNotification.error(response?.data?.message || "Login failed");
      }
    } catch (error) {
      showNotification.error(error?.response?.data?.message || "Login failed");
      console.error("Login failed:", error);
    }
  };

  return (
    <LoginContext.Provider value={{ submitLoginForm }}>
      {children}
    </LoginContext.Provider>
  );
}

export { LoginContext, LoginController };
