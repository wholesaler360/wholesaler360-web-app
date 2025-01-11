import LoginComponent from "@/pages/authentication/Login/login-index";
import Dashboard from "@/pages/Features/Dashboard.jsx";

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
