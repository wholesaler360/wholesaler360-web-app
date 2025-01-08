import React, { createContext, useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { usePost } from "@/API/api-context";
import { toast } from "@/hooks/use-toast";
import { setAccessToken } from "@/lib/authUtils";

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

      const response = await usePost("/auth/login", formData);

      if (response.code === 200) {
        setAccessToken(response.data.accessToken);
        navigate("/"); // Navigate to home page on successful login
      } else {
        throw new Error("Invalid response code");
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Login failed. Please try again.",
        variant: "error",
      });
      Navigate("/login");
    }
  };

  return (
    <LoginContext.Provider value={{ submitLoginForm }}>
      {children}
    </LoginContext.Provider>
  );
}

// Custom hook to use LoginContext easily
function useLoginContext() {
  return useContext(LoginContext);
}

export { LoginContext, LoginController, useLoginContext };
