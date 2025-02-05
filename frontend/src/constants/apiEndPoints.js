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

//Vendor
export const FetchAllVendors = "/vendor/fetchAll";
export const FetchVendor = "/vendor/fetch";
export const DeleteVendor = "/vendor/delete";
export const CreateVendor = "/vendor/create";