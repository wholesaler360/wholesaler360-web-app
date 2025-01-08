import { RefreshTokenApi } from "@/API/api_end_points";
import axios from "axios";
import { clearAccessToken, getAccessToken, setAccessToken } from "./authUtils";
import { toast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // Import meta.env to access Vite environment variables


const api = axios.create({
  baseURL: "http://localhost:4000/", // Replace with your backend URL
  timeout: 10000,
  withCredentials: true, // Required for refresh token in cookies
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await api.post(`${RefreshTokenApi}`);
        setAccessToken(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        Navigate("/login");
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
