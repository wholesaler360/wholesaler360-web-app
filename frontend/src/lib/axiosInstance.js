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
  },
});

api.interceptors.request.use(
  async (config) => {
    if (config.url === RefreshTokenApi) {
      return config;
    }
    const token = getAccessToken();
    if (token) {
      const isExpired = await isAccessTokenExpired();
      if (isExpired) {
        const newToken = await refreshAccessToken();
        console.log("New Token:", newToken);
        if (!newToken) {
          clearAccessToken();
          showNotification.error("Session expired. Please login again.");
          return Promise.reject("Session expired");
        }
        setAccessToken(newToken);
        config.headers.Authorization = `Bearer ${newToken}`;
        return config;
      }
      config.headers.Authorization = `Bearer ${token}`;
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
