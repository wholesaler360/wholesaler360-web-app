import { axiosPost } from "@/constants/api-context";
import { clearAccessToken } from "@/lib/authUtils";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createContext } from "react";
import { showNotification } from "@/core/toaster/toast";
import { LogoutApi } from "@/constants/apiEndPoints";

const UserMenuContext = createContext({
  logout: () => {},
});

const UserMenuController = ({ children }) => {
  const navigate = useNavigate();
  const logout = async () => {
    const response = await axiosPost(LogoutApi);
    if (response?.status === 200) {
      clearAccessToken();
      navigate("/login");
      showNotification.success("Logged out successfully");
    } else {
      console.error("Logout failed:", response);
      showNotification.error("Logout Failed");
    }
  };

  return (
    <UserMenuContext.Provider value={{ logout }}>
      {children}
    </UserMenuContext.Provider>
  );
};

export { UserMenuContext, UserMenuController };
