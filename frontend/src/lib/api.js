import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000", // Update with your backend URL
  withCredentials: true, // Required for HttpOnly cookies
});

export default api;
