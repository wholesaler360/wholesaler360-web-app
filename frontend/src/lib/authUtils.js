import { ACCESS_TOKEN_KEY } from "@/constants/globalConstants";

export const getAccessToken = () => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
};

export const setAccessToken = (token) => {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error("Error setting access token:", error);
    return false;
  }
};

export const clearAccessToken = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);

    return true;
  } catch (error) {
    console.error("Error clearing access token:", error);
    return false;
  }
};
