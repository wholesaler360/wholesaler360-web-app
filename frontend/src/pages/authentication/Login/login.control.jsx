import React, { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { axiosPost } from "@/constants/api-context";
import { setAccessToken } from "@/lib/authUtils";
import { showNotification } from "@/core/toaster/toast";
import { LoginApi } from "@/constants/apiEndPoints";

// Create the LoginContext with default values
const LoginContext = createContext({
  submitLoginForm: async (data) => {},
});

// LoginController component to provide context
function LoginController({ children }) {
  const navigate = useNavigate();

  const submitLoginForm = async (data) => {
    try {
      const formData = {
        mobileNo: data.mobile,
        password: data.password,
      };

      const response = await axiosPost(LoginApi, formData);
      if (response?.status === 200) {
        setAccessToken(response.data.value.accessToken);
        navigate("/"); // Redirect to home page
      } else {
        if (response?.data?.message) {
          showNotification.error(response?.data?.message);
        } else {
          showNotification.error("Login Failed");
        }
      }
    } catch (error) {
      showNotification.error("Login Failed");
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
