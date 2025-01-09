import LoginComponent from "@/pages/authentication/Login/login-index";
import Dashboard from "@/pages/Features/Dashboard.jsx";
import Logout from "@/pages/Features/Logout";

const authRoutes = [
  {
    path: "/",
    element: <Dashboard />,
  },
];

const unAuthRoutes = [
  {
    path: "/login",
    element: <LoginComponent />,
  },
];

export { authRoutes, unAuthRoutes };
