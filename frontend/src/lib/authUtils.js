import { RefreshTokenApi, FetchRolePermission } from "@/constants/apiEndPoints";
import {
  ACCESS_TOKEN_KEY,
  USER_DATA_KEY,
  USER_PERMISSIONS_KEY,
} from "@/constants/globalConstants";
import { jwtDecode } from "jwt-decode";
import { axiosGet, axiosPost } from "@/constants/api-context";
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

    return exp < currentTime; // Return true if expired, false otherwise
  } catch (error) {
    console.error("Error checking token expiry:", error.message);
    return true; // Assume expired if there's any issue
  }
};

export const refreshAccessToken = async () => {
  try {
    const data = await axiosGet(RefreshTokenApi);
    console.log(data);
    return data.value.newAccessToken;
  } catch (error) {
    console.error("Error refreshing access token:", error.message);
    return null; // Return null to indicate failure
  }
};

const fetchAndProcessPermissions = async (roleName) => {
  try {
    const response = await axiosGet(`${FetchRolePermission}/${roleName}`);
    if (!response.data.success) throw new Error("Failed to fetch role permissions");

    const processedPermissions = {};
    response.data.value.sections.forEach(({ module, permission }) => {
      processedPermissions[module.name] = getPermissionsFromNumber(permission);
    });

    return processedPermissions;
  } catch (error) {
    console.error("Error processing permissions:", error.message);
    return null;
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

    // Fetch and store permissions
    const permissions = await fetchAndProcessPermissions(userData.role.name);
    if (permissions) {
      localStorage.setItem(USER_PERMISSIONS_KEY, JSON.stringify(permissions));
    }

    return true;
  } catch (error) {
    console.error("Error setting auth data:", error.message);
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

export const clearAuthData = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(USER_PERMISSIONS_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing auth data:", error.message);
    return false;
  }
};
