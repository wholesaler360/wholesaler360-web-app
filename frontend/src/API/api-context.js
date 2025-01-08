import axios from "axios";
import { toast } from "@/hooks/use-toast";

/**
 * Function to perform a GET request.
 *
 * @param {string} endpoint - API endpoint URL.
 * @param {object} options - Configuration options for the request.
 * @param {Function} options.onSuccess - Callback executed on success.
 * @param {Function} options.onError - Callback executed on error.
 * @param {object} options.toastMessages - Toast messages for success and error.
 * @param {string} options.toastMessages.success - Success toast message.
 * @param {string} options.toastMessages.error - Error toast message.
 * @param {object} options.queryParams - Query parameters to append to the URL.
 * @param {Array<string>} options.queryKeysToInvalidate - Keys for cache invalidation.
 *
 * @returns {Promise<any>} - The response data from the GET request.
 */
const useGet = async (
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
    const response = await axios.get(url);

    // Handle success
    if (options.toastMessages?.success) {
      toast.success(options.toastMessages.success);
    }
    if (options.onSuccess) {
      options.onSuccess(response.data);
    }

    return response.data;
  } catch (error) {
    // Handle errors
    if (options.toastMessages?.error) {
      toast.error(options.toastMessages.error);
    }
    if (options.onError) {
      options.onError(error);
    }
    console.error("GET request error:", error);

    throw error; // Re-throw for further handling if needed
  }
};

const usePost = async (
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
      toast({
        title: "Success",
        description: options.toastMessages.success,
      });
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
      toast({
        title: "Error",
        description: options.toastMessages.error,
        variant: "error",
      });
    }
    if (options.onError) {
      options.onError(error);
    }
    console.error("POST request error:", error);

    throw error; // Re-throw for further handling if needed
  }
};

export { useGet, usePost };
