import React, { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { axiosPost } from "@/constants/api-context";
import { setAuthData } from "@/lib/authUtils";
import { showNotification } from "@/core/toaster/toast";
import {
  LoginApi,
  ForgotPasswordApi,
  ValidateOtpApi,
} from "@/constants/apiEndPoints";
import { useAuth } from "@/context/auth-context";

const LoginContext = createContext({
  submitLoginForm: async (data) => {},
  submitForgotPassword: async (mobileNo) => {},
  verifyOtpAndResetPassword: async (data) => {},
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
        await setAuthData(response.data);

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

  const submitForgotPassword = async (mobileNo) => {
    try {
      const formData = {
        mobileNo: mobileNo,
      };

      const response = await axiosPost(ForgotPasswordApi, formData);

      if (response?.status === 201 && response?.data?.success) {
        showNotification.success(
          response.data.message || "OTP sent to your registered email"
        );
        return true;
      } else {
        showNotification.error(response?.data?.message || "Failed to send OTP");
        return false;
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Failed to send OTP";

      if (errorMsg.includes("does not have email")) {
        showNotification.error(
          "No email address registered with this mobile number. Please contact admin."
        );
      } else {
        showNotification.error(errorMsg);
      }

      console.error("Forgot password error:", error);
      return false;
    }
  };

  const verifyOtpAndResetPassword = async (data) => {
    try {
      const formData = {
        mobileNo: data.mobileNo,
        otp: data.otp,
        newPassword: data.newPassword,
      };

      const response = await axiosPost(ValidateOtpApi, formData);

      if (response?.status === 200 && response?.data?.success) {
        showNotification.success(
          response.data.message || "Password reset successful"
        );
        return true;
      } else {
        showNotification.error(
          response?.data?.message || "Password reset failed"
        );
        return false;
      }
    } catch (error) {
      showNotification.error(
        error?.response?.data?.message || "Password reset failed"
      );
      console.error("OTP verification error:", error);
      return false;
    }
  };

  return (
    <LoginContext.Provider
      value={{
        submitLoginForm,
        submitForgotPassword,
        verifyOtpAndResetPassword,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
}

export { LoginContext, LoginController };
