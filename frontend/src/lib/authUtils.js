import { RefreshTokenApi } from "@/constants/apiEndPoints";
import { ACCESS_TOKEN_KEY } from "@/constants/globalConstants";
import api from "./axiosInstance";
import { jwtDecode } from "jwt-decode";
import { axiosPost } from "@/context/api-context";

export const getAccessToken = () => {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) throw new Error("Access token not found");
    return token;
  } catch (error) {
    return null;
  }
};

export const setAccessToken = (token) => {
  try {
    if (!token) throw new Error("Invalid token provided");
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error("Error setting access token:", error.message);
    return false;
  }
};

export const clearAccessToken = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing access token:", error.message);
    return false;
  }
};

export const isAccessTokenExpired = async () => {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Token is not available for expiry check");
    const { exp } = jwtDecode(token); // Decode the token to extract expiry
    const currentTime = Math.floor(new Date().getTime() / 1000);

    return exp < currentTime; // Return true if expired, false otherwise
  } catch (error) {
    console.error("Error checking token expiry:", error.message);
    return true; // Assume expired if there's any issue
  }
};

export const refreshAccessToken = async () => {
  try {
    const { data } = await axiosPost(RefreshTokenApi);
    setAccessToken(data.accessToken); // Directly set the new token
    return data.accessToken;
  } catch (error) {
    console.error("Error refreshing access token:", error.message);
    return null; // Return null to indicate failure
  }
};
