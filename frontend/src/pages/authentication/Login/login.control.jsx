import React, { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { axiosPost } from "@/API/api-context";
import { setAccessToken } from "@/lib/authUtils";
import { showNotification } from "@/core/toaster/toast";

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
        mobile: data.mobile,
        password: data.password,
      };

      const response = await axiosPost("/auth/login", formData, {
        toastMessages: {
          success: "Login Successful",
          error: "Login Failed",  
        },
      });
      console.log(response);
      if (response.code === 200) {
        setAccessToken(response.data.accessToken);
        navigate("/"); // Redirect to home page
      } else {
        showNotification.error("Login Failed");
      }
    } catch (error) {
      showNotification.error("Login Failed");
      throw new Error("Login Failed");
    }
  };

  return (
    <LoginContext.Provider value={{ submitLoginForm }}>
      {children}
    </LoginContext.Provider>
  );
}

export { LoginContext, LoginController };
