import Login from "@/pages/authentication/Login";
import Categories from "@/pages/Features/categories";
import Customers from "@/pages/Features/customer";
import AddCustomer from "@/pages/Features/customer/addCustomer";
import UpdateCustomer from "@/pages/Features/customer/updateCustomer";
import Dashboard from "@/pages/Features/dashboard/index";
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
import VendorLedger from "@/pages/Features/vendor-ledger";
import Purchases from "@/pages/Features/purchases";
import AddPurchase from "@/pages/Features/purchases/addPurchase";
import PurchaseDetails from "@/pages/Features/purchases/PurchaseDetails";
import Invoices from "@/pages/Features/invoice";
import AddInvoice from "@/pages/Features/invoice/addInvoice";
import Payments from "@/pages/Features/payments";
import Users from "@/pages/Features/users";
import AddUser from "@/pages/Features/users/addUser";
import UpdateUser from "@/pages/Features/users/updateUser";
import AppSettings from "@/pages/Features/app-settings";
import ViewInvoice from "@/pages/Features/invoice/viewInvoice";
import CustomerLedger from "@/pages/Features/customer-ledger";
import Home from "@/pages/Features/home";
import VendorDetails from "@/pages/Features/vendor/VendorDetails";
import CustomerDetails from "@/pages/Features/customer/CustomersDetails";

const authRoutes = [
  {
    path: "/",
    element: <Home />,
    permission: "account-settings", // Default route
  },
  {
    path: "/dashboard",
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
    path: "/customer/details/:mobileNo",
    element: <CustomerDetails />,
    permission: "customer",
  },
  {
    path: "/customer/ledger/:id",
    element: <CustomerLedger />,
    permission: "customer-ledger",
  },
  {
    path: "/vendors",
    element: <Vendors />,
    permission: "vendor",
  },
  {
    path: "/vendor/details/:mobileNo",
    element: <VendorDetails />,
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
    path: "/vendor/ledger/:id",
    element: <VendorLedger />,
    permission: "vendor-ledger",
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
  {
    path: "/purchases",
    element: <Purchases />,
    permission: "purchase",
  },
  {
    path: "/purchase/add",
    element: <AddPurchase />,
    permission: "purchase",
  },
  {
    path: "/purchase/details/:id",
    element: <PurchaseDetails />,
    permission: "purchase",
  },
  {
    path: "/invoices",
    element: <Invoices />,
    permission: "invoice",
  },
  {
    path: "/invoice/add",
    element: <AddInvoice />,
    permission: "invoice",
  },
  {
    path: "/payments",
    element: <Payments />,
    permission: "payment",
  },
  {
    path: "/users",
    element: <Users />,
    permission: "user",
  },
  {
    path: "/user/add",
    element: <AddUser />,
    permission: "user",
  },
  {
    path: "/user/edit",
    element: <UpdateUser />,
    permission: "user",
  },
  {
    path: "/app-settings",
    element: <AppSettings />,
    permission: "app-settings",
  },
  {
    path: "/invoice/view/:id",
    element: <ViewInvoice />,
    permission: "invoice",
  },
];

const unAuthRoutes = [
  {
    path: "/login",
    element: <Login />,
  },
];

export { authRoutes, unAuthRoutes };
