import { RefreshTokenApi } from "@/constants/apiEndPoints";
import axios from "axios";
import {
  clearAccessToken,
  getAccessToken,
  isAccessTokenExpired,
  refreshAccessToken,
  setAccessToken,
} from "./authUtils";
import { showNotification } from "@/core/toaster/toast";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: BACKEND_URL || "http://127.0.0.1:9991",
  timeout: 10000,
  withCredentials: true, // Required for refresh token in cookies
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Access-Control-Allow-Credentials": true,
  },
});

api.interceptors.request.use(
  async (config) => {
    // Ensure withCredentials is always true
    config.withCredentials = true;

    if (config.url === RefreshTokenApi) {
      // For refresh token requests, ensure cookies are included
      config.headers["Access-Control-Allow-Credentials"] = true;
      return config;
    }

    const token = getAccessToken();
    if (token) {
      const isExpired = await isAccessTokenExpired();
      if (isExpired) {
        try {
          const newToken = await refreshAccessToken();
          if (!newToken) {
            clearAccessToken();
            showNotification.error("Session expired. Please login again.");
            return Promise.reject("Session expired");
          }
          setAccessToken(newToken);
          config.headers.Authorization = `Bearer ${newToken}`;
        } catch (error) {
          clearAccessToken();
          showNotification.error("Error refreshing session");
          return Promise.reject("Refresh token error");
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    return Promise.reject(error);
  }
);

export default api;
