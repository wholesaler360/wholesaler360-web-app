import Login from "@/pages/authentication/Login.jsx";
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
    element: <Login />,
  },
];

export { authRoutes, unAuthRoutes };
