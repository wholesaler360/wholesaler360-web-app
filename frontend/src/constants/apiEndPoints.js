// Authentication API end points
export const LoginApi = "/auth/login";
export const RefreshTokenApi = "/auth/refreshAccessToken";
export const LogoutApi = "/auth/logout";

// Roles And Permissions
export const FetchAllRoles = "/role/fetchAllRoles";
export const UpdateRole = "/role/updateRole";
export const FetchRolePermission = "/role/fetchRole";
export const assignPermission = "/role/assignPermission";
export const createRole = "/role/createRole";
export const deleteRole = "/role/deleteRole";

// Categories
export const FetchAllCategories = "category/getAllCategories";
export const CreateCategory = "/category/createCategory";
export const UpdateCategory = "/category/updateCategory";
export const DeleteCategory = "/category/deleteCategory";

// Products
export const FetchAllProducts = "/product/fetchAllProduct";
export const FetchProduct = "/product/fetchProduct";
export const FetchProductListDropdown = "/product/fetchProductDropdown";
export const FetchProductListDropdownInvoice = "/product/fetchProductDropdownInvoice";
export const DeleteProduct = "product/deleteProduct";
export const CreateProduct = "/product/createProduct";
export const FetchAllTaxes = "/tax/getAllTax";
export const GenerateImage = "/product/generateImage";
export const UpdateProduct = "/product/updateProduct";
export const UpdateProductImage = "product/updateProductImage";

//Customer
export const FetchAllCustomers = "/customer/fetchAll";
export const FetchCustomer = "/customer/fetch";
export const CreateCustomer = "/customer/create";
export const UpdateCustomer = "/customer/update";
export const UpdateCustomerImage = "/customer/updateImg";
export const DeleteCustomer = "/customer/delete";
export const FetchCustomerList = "customer/fetchCustomerDropdown";

//Vendor
export const FetchAllVendors = "/vendor/fetchAll";
export const FetchVendor = "/vendor/fetch";
export const FetchVendorList = "/vendor/fetchList";
export const DeleteVendor = "/vendor/delete";
export const CreateVendor = "/vendor/create";
export const UpdateVendorAvatar = "/vendor/updateAvatar";
export const UpdateVendor = "/vendor/update";

// Vendor Ledger
export const FetchVendorLedgers = "/vendor-ledger/show";
export const CreateVendorLedger = "/vendor-ledger/create";

// Inventory
export const FetchAllInventories = "/inventory/fetch";

// Account Settings
export const fetchAccountDetails = "/account-settings/fetch";
export const updateAccountDetails = "/account-settings/update";
export const changePassword = "/account-settings/changePassword";
export const changeAvatar = "/account-settings/changeAvatar";

// Company Settings
export const fetchCompanyDetails = "/company-settings/companyDetails/fetch";
export const fetchCompanySignature = "/company-settings/signature/fetch";
export const fetchCompanyBankDetails = "/company-settings/bankDetails/fetch";
export const updateCompanyDetails = "/company-settings/companyDetails/update";
export const updateCompanyBankDetails = "/company-settings/bankDetails/update";
export const updateCompanyLogo = "/company-settings/companyDetails/updateLogo";
export const addCompanySignature = "/company-settings/signature/create";
export const fetchCompanySignatures = "/company-settings/signature/fetch";
export const deleteCompanySignature = "/company-settings/signature/delete";
export const updateCompanyFavicon =
  "/company-settings/companyDetails/updateFavicon";

// Purchase
export const FetchAllPurchases = "/purchase/fetchAll";
export const CreatePurchase = "/purchase/create";

// Inovice
export const FetchAllInvoices = "/invoice/fetchAll";
export const CreateInvoice = "/invoice/create";