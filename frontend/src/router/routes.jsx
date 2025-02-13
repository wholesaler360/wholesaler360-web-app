import Login from "@/pages/authentication/Login";
import Categories from "@/pages/Features/categories";
import Customers from "@/pages/Features/customer";
import AddCustomer from "@/pages/Features/customer/addCustomer";
import UpdateCustomer from "@/pages/Features/customer/updateCustomer";
import Dashboard from "@/pages/Features/dashboard/Dashboard.jsx";
import Demo from "@/pages/Features/Demo";
import Products from "@/pages/Features/products";
import AddProduct from "@/pages/Features/products/addProduct";
import UpdateProduct from "@/pages/Features/products/updateProduct";
import RolesAndPermissions from "@/pages/Features/roles and permissions/index.jsx";
import Vendors from "@/pages/Features/vendor";
import AddVendor from "@/pages/Features/vendor/addVendor";
import UpdateVendor from "@/pages/Features/vendor/updateVendor";

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
    path: "/product/add",
    element: <AddProduct />,
  },
  {
    path: "/product/edit",
    element: <UpdateProduct />,
  },
  {
    path: "/customers",
    element: <Customers />,
  },
  {
    path: "/customer/add",
    element: <AddCustomer />,
  },
  {
    path: "/customer/edit",
    element: <UpdateCustomer />,
  },
  {
    path: "/vendors",
    element: <Vendors />,
  },
  {
    path: "/vendor/add",
    element: <AddVendor />,
  },
  {
    path: "/vendor/edit",
    element: <UpdateVendor />,
  },
];

const unAuthRoutes = [
  {
    path: "/login",
    element: <Login />,
  },
];

export { authRoutes, unAuthRoutes };
