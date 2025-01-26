import Login from "@/pages/authentication/Login";
import Categories from "@/pages/Features/categories";
import Dashboard from "@/pages/Features/dashboard/Dashboard.jsx";
import Demo from "@/pages/Features/Demo";
import Products from "@/pages/Features/products";
import AddProduct from "@/pages/Features/products/addProduct";
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
  {
    path: "/categories",
    element: <Categories />,
  },
  {
    path: "/products",
    element: <Products />,
  },
  {
    path: "/products/add",
    element: <AddProduct />
  },
];

const unAuthRoutes = [
  {
    path: "/login",
    element: <Login />,
  },
];

export { authRoutes, unAuthRoutes };
