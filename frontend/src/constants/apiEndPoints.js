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
export const DeleteProduct = "product/deleteProduct";
