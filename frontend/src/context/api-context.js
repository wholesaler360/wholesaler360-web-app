import api from "@/lib/axiosInstance";
import { showNotification } from "@/core/toaster/toast";

const axiosGet = async (endpoint = null) => {
  try {
    // Validate endpoint
    if (!endpoint || typeof endpoint !== "string") {
      throw new Error("Valid endpoint is required");
    }

    const url = `${api.defaults.baseURL}${endpoint}`;
    const response = await api.get(url);

    return response.data;
  } catch (error) {
    console.error("GET request error:", {
      message: error.message,
      response: error.response,
      config: error.config,
    });
  }
};

const axiosPost = async (endpoint = null, data = {}) => {
  try {
    // if (!endpoint || typeof endpoint !== "string") {
    //   throw new Error("Valid endpoint is required");
    // }
    const response = await api.post(endpoint, data);
    return response;
  } catch (error) {
    console.error("POST request error:", {
      message: error.response.data.message,
      statusCode: error.response.data.statusCode,
      config: error.config,
    });
    return error.response;
  }
};

export { axiosGet, axiosPost };
