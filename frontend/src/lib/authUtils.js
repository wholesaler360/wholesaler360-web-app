import { RefreshTokenApi } from "@/constants/apiEndPoints";
import {
  ACCESS_TOKEN_KEY,
  USER_DATA_KEY,
  USER_PERMISSIONS_KEY,
  COMPANY_DETAILS_KEY,
  THEME,
} from "@/constants/globalConstants";
import { jwtDecode } from "jwt-decode";
import { axiosGet } from "@/constants/api-context";
import { getPermissionsFromNumber } from "./roleUtils";

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

    return exp < ( currentTime + 10 ) ; // Return true if expired, false otherwise
  } catch (error) {
    console.error("Error checking token expiry:", error.message);
    return true; // Assume expired if there's any issue
  }
};

export const refreshAccessToken = async () => {
  try {
    const data = await axiosGet(RefreshTokenApi);
    console.log(data);
    return data.data.value.newAccessToken;
  } catch (error) {
    console.error("Error refreshing access token:", error.message);
    return null; // Return null to indicate failure
  }
};

export const getStoredPermissions = () => {
  try {
    const permissionsStr = localStorage.getItem(USER_PERMISSIONS_KEY);
    return permissionsStr ? JSON.parse(permissionsStr) : null;
  } catch (error) {
    console.error("Error getting stored permissions:", error.message);
    return null;
  }
};

export const getCompanyDetails = () => {
  try {
    const companyDetailsStr = localStorage.getItem(COMPANY_DETAILS_KEY);
    return companyDetailsStr ? JSON.parse(companyDetailsStr) : null;
  } catch (error) {
    console.error("Error getting company details:", error.message);
    return null;
  }
};

export const setCompanyDetails = (companyDetails) => {
  try {
    if (!companyDetails) {
      throw new Error("Invalid company details");
    }
    localStorage.setItem(COMPANY_DETAILS_KEY, JSON.stringify(companyDetails));
    return true;
  } catch (error) {
    console.error("Error setting company details:", error.message);
    return false;
  }
};

export const setAuthData = async (authResponse) => {
  try {
    if (!authResponse?.value?.accessToken || !authResponse?.value?.user) {
      throw new Error("Invalid auth response");
    }

    // Store token
    localStorage.setItem(ACCESS_TOKEN_KEY, authResponse.value.accessToken);

    // Store user data
    const userData = {
      ...authResponse.value.user,
      lastLoginAt: new Date().toISOString(),
    };
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

    // Store company details if available
    if (authResponse.value.companyDetails) {
      setCompanyDetails(authResponse.value.companyDetails);
    }

    // Extract and store permissions directly from user object
    if (userData.role && userData.role.sections) {
      const processedPermissions = {};
      userData.role.sections.forEach(({ module, permission }) => {
        processedPermissions[module] = getPermissionsFromNumber(permission);
      });
      localStorage.setItem(
        USER_PERMISSIONS_KEY,
        JSON.stringify(processedPermissions)
      );
    }

    return true;
  } catch (error) {
    console.error("Error setting auth data:", error.message);
    clearAuthData(); // Clean up on failure
    return false;
  }
};

export const getUserData = () => {
  try {
    const userDataStr = localStorage.getItem(USER_DATA_KEY);
    return userDataStr ? JSON.parse(userDataStr) : null;
  } catch (error) {
    console.error("Error getting user data:", error.message);
    return null;
  }
};

export const updateUserData = (updatedData) => {
  try {
    // Get existing user data
    const currentUserData = getUserData();
    if (!currentUserData) {
      throw new Error("No existing user data found");
    }

    // Update only the fields that are provided
    const newUserData = {
      ...currentUserData,
      ...updatedData,
      // Preserve these fields from the original data
      role: currentUserData.role,
      _id: currentUserData._id,
      __v: currentUserData.__v,
      // Update the updatedAt timestamp
      updatedAt: new Date().toISOString(),
    };

    // Save the updated user data
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(newUserData));
    return newUserData;
  } catch (error) {
    console.error("Error updating user data:", error.message);
    return null;
  }
};

export const clearAuthData = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(USER_PERMISSIONS_KEY);
    localStorage.removeItem(COMPANY_DETAILS_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing auth data:", error.message);
    return false;
  }
};

export const getCurrentTheme = () => {
  return localStorage.getItem(THEME) || "light";
};

export const setNewTheme = (themeName) => {
  try {
   localStorage.setItem(THEME, themeName);
  } catch {
    console.log("Error setting theme on local storage");
  }
};
