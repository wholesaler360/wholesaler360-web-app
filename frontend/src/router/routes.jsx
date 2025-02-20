import Login from "@/pages/authentication/Login";
import Categories from "@/pages/Features/categories";
import Customers from "@/pages/Features/customer";
import AddCustomer from "@/pages/Features/customer/addCustomer";
import UpdateCustomer from "@/pages/Features/customer/updateCustomer";
import Dashboard from "@/pages/Features/dashboard/Dashboard.jsx";
import Stock from "@/pages/Features/stock";
import Products from "@/pages/Features/products";
import AddProduct from "@/pages/Features/products/addProduct";
import UpdateProduct from "@/pages/Features/products/updateProduct";
import RolesAndPermissions from "@/pages/Features/roles and permissions/index.jsx";
import Vendors from "@/pages/Features/vendor";
import AddVendor from "@/pages/Features/vendor/addVendor";
import UpdateVendor from "@/pages/Features/vendor/updateVendor";
import AccountSettings from "@/pages/Features/account-settings";
import CompanySettings from "@/pages/Features/company-settings";

const authRoutes = [
  {
    path: "/",
    element: <Dashboard />,
    permission: "dashboard", // Dashboard permission
  },
  {
    path: "/roles-and-permissions",
    element: <RolesAndPermissions />,
    permission: "role",
  },
  {
    path: "/categories",
    element: <Categories />,
    permission: "category",
  },
  {
    path: "/products",
    element: <Products />,
    permission: "product",
  },
  {
    path: "/product/add",
    element: <AddProduct />,
    permission: "product",
  },
  {
    path: "/product/edit",
    element: <UpdateProduct />,
    permission: "product",
  },
  {
    path: "/customers",
    element: <Customers />,
    permission: "customer",
  },
  {
    path: "/customer/add",
    element: <AddCustomer />,
    permission: "customer",
  },
  {
    path: "/customer/edit",
    element: <UpdateCustomer />,
    permission: "customer",
  },
  {
    path: "/vendors",
    element: <Vendors />,
    permission: "vendor",
  },
  {
    path: "/vendor/add",
    element: <AddVendor />,
    permission: "vendor",
  },
  {
    path: "/vendor/edit",
    element: <UpdateVendor />,
    permission: "vendor",
  },
  {
    path: "/stock",
    element: <Stock />,
    permission: "inventory",
  },
  {
    path: "/account-settings",
    element: <AccountSettings />,
    permission: "account-settings",
  },
  {
    path: "/company-settings",
    element: <CompanySettings />,
    permission: "company-settings",
  },
];

const unAuthRoutes = [
  {
    path: "/login",
    element: <Login />,
  },
];

export { authRoutes, unAuthRoutes };
