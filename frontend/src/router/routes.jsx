import LoginComponent from "@/pages/authentication/Login/login-index";
import Dashboard from "@/pages/Features/Dashboard.jsx";
import Demo from "@/pages/Features/Demo";

const authRoutes = [
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/demo",
    element: <Demo />,
  },
];

const unAuthRoutes = [
  {
    path: "/login",
    element: <LoginComponent />,
  },
];

export { authRoutes, unAuthRoutes };
