import axios from "axios";
import { getAccessToken } from "@/lib/authUtils";
import { showNotification } from "@/core/toaster/toast";

const axiosGet = async (
  endpoint = null,
  options = {
    onSuccess: null,
    onError: null,
    toastMessages: {
      success: "Data fetched successfully!",
      error: "An error occurred while fetching data. Please try again.",
    },
    queryParams: {}, // Optional query parameters
    queryKeysToInvalidate: [],
  }
) => {
  try {
    // Validate endpoint
    if (!endpoint) {
      throw new Error("Endpoint is required");
    }

    // Append query parameters to the endpoint
    const queryString = new URLSearchParams(options.queryParams).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    // Perform GET request
    const response = await axios.get("http://127.0.0.1:4000" + url);

    // Handle success
    if (options.toastMessages?.success) {
      //
    }
    if (options.onSuccess) {
      //
    }

    return response;
  } catch (error) {
    // Handle errors
    if (options.toastMessages?.error) {
      //
      showNotification.error(options.toastMessages.error);
    }
    if (options.onError) {
      //
    }
    console.error("GET request error:", error);

    throw error;
  }
};

const axiosPost = async (
  endpoint = null,
  data = {},
  options = {
    onSuccess: null,
    onError: null,
    toastMessages: {
      success: "Operation successful!",
      error: "An error occurred. Please try again.",
    },
    queryKeysToInvalidate: [],
  }
) => {
  try {
    // Validate endpoint
    if (!endpoint) {
      throw new Error("Endpoint is required");
    }

    // Perform POST request
    const response = await axios.post("http://127.0.0.1:4000/auth/login", data);
    // Handle success
    if (options.toastMessages?.success) {
      showNotification.success(options.toastMessages.success);
    }
    if (options.onSuccess) {
      options.onSuccess(response.data);
    }

    return {
      code: response.status,
      data: response.data,
    };
  } catch (error) {
    // Handle errors
    if (options.toastMessages?.error) {
      showNotification.error(options.toastMessages.error);
    }
    if (options.onError) {
      options.onError(error);
    }
    console.error("POST request error:", error);

    throw error; // Re-throw for further handling if needed
  }
};

export { axiosGet, axiosPost };
