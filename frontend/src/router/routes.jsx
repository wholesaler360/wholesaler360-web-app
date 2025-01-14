import Login from "@/pages/authentication/Login";
import Dashboard from "@/pages/Features/dashboard/Dashboard.jsx";
import Demo from "@/pages/Features/Demo";
import RolesAndPermissions from "@/pages/Features/roles and permissions/index.jsx";

const authRoutes = [
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/demo",
    element: <Demo />,
  },
  {
    path: "/roles-and-permissions",
    element: <RolesAndPermissions />,
  },
];

const unAuthRoutes = [
  {
    path: "/login",
    element: <Login />,
  },
];

export { authRoutes, unAuthRoutes };
