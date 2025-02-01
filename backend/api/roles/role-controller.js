import { User } from "../users/user-model.js";
import { Role } from "./role-model.js";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import { Module } from "../sections/module-model.js";

const createRole = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  if (!name?.trim()) {
    return next(ApiError.validationFailed("Role name is required"));
  }

  const roleName = name.trim().toLowerCase();
  const existingRole = await Role.findOne({
    name: roleName,
    isRoleDeleted: false,
  });
  if (existingRole) {
    return next(
      ApiError.valueAlreadyExists("Role with this name already exists")
    );
  }

  const fetchedModule = await Module.findOne({ name: "dashboard" });
  if (!fetchedModule) {
    return next(ApiError.dataNotFound("Default module 'dashboard' not found"));
  }
  try {
    const role = new Role({
      name: roleName,
      sections: [{ module: fetchedModule._id, permission: 8 }],
    });

    await role.save();

    // Respond with success
    res
      .status(201)
      .json(ApiResponse.successCreated(role, "Role created successfully"));
  } catch (error) {
    console.log("inside catch");
    return next(ApiError.dataNotInserted("Role not created"));
  }
});

const updateRole = asyncHandler(async (req, res, next) => {

    const { name , newName } = req.body;

    if (!name?.trim() || !newName?.trim()) {
        return next(ApiError.validationFailed("Role name is required"));
    }

    const roleName = name.trim().toLowerCase();
    // Checks if user is trying to update own role
    if(roleName === 'super admin' || req.fetchedUser.role.name === roleName)
    {
        return next(ApiError.validationFailed("Cannot update your own role"));
    }

    
    const existingRole = await Role.findOne({ name: roleName , isRoleDeleted : false });
    if (!existingRole ) {
        return next(ApiError.dataNotFound("Role with this name does not  exists"));
    }
    
    const newRoleName = newName.trim().toLowerCase();
    
    const roleWithNewName = await Role.findOne({ name: newRoleName , isRoleDeleted : false });
    if(roleWithNewName)
    {
        return next(ApiError.validationFailed("Role with this name already exists"));
    } 

    try {
      existingRole.name = newRoleName;
      await existingRole.save();
      // Respond with success
      res
        .status(200)
        .json(
          ApiResponse.successUpdated(existingRole, "Role updated successfully")
        );
    } catch (error) {
      return next(ApiError.dataNotUpdated("Role not updated"));
    }

});

const fetchPermission = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  if (!name?.trim()) {
    return next(ApiError.validationFailed("Role name is required"));
  }

  const roleName = name.trim().toLowerCase();

  const existingRole = await Role.findOne({
    name: roleName,
    isRoleDeleted: false,
  })
    ?.populate({
      path: "sections.module",
      select: "-__v -createdAt -updatedAt", // Exclude fields from populated documents
    })
    .select("-createdAt -updatedAt -sections._id -__v"); // Exclude fields from the main query

  if (!existingRole) {
    return next(ApiError.dataNotFound("Role with this name does not exists"));
  }

  // Embed all modules in the response
  const allModules = await Module.find();
  const setOfExistingModules = new Set(existingRole.sections.map((section) => section.module.name));
  
  allModules.forEach((module) => {
    if(!setOfExistingModules.has(module.name))
    {
      const {_id, name} = module;
        existingRole.sections.push({
            module: {_id,name},
            permission : 0
        });
    }
  });
  
  // Todo to remove the sections sub_id fromt the existingRole
  res
    .status(200)
    .json(ApiResponse.successRead(existingRole, "Role fetched successfully"));
});

const countNoOfUsersHavingRole = async (roleId) => {

    const count = await User.countDocuments({ role : roleId });
    return count;
};

const assignPermission = asyncHandler(async (req, res, next) => {
    const { name, sections } = req.body;
    const currentUser = req.fetchedUser;
    
    if (!name?.trim()) {
        return next(ApiError.validationFailed("Role name is required"));
    }
    const roleName = name.trim().toLowerCase();
    
    if(name === 'super admin')
    {
        return next(ApiError.validationFailed("Cannot update super admin role"));
    }


    if(roleName === currentUser.role.name)
    {
        return next(ApiError.validationFailed("Cannot update your own role"));
    }

    if (sections && !Array.isArray(sections)) {
        return next(ApiError.validationFailed("Sections must be an array"));
    }

    const existingRole = await Role.findOne({ name : roleName , isRoleDeleted : false });

    if (!existingRole) {
        return next(ApiError.dataNotFound("Role with this name does not exists"));
    }
    try {
        // Prepare sections for update
        const preparedSections = await Promise.all(
            sections.map(async (section) => {
                if (!section?.module || section?.permission === undefined || (typeof section?.permission !== "number")) {
                    return next(ApiError.validationFailed("Module and permission are required for each section"));
                }

                // Check if the module exists
                const moduleDoc = await Module.findOne({ name : section.module });
                if (!moduleDoc) {
                    return next(ApiError.dataNotFound(`${section.module} does not exist`));
                }
                return {
                    module: moduleDoc._id,
                    permission: parseInt(section.permission, 10),
                };
            })
        );


    // Update the role with the prepared sections
    existingRole.sections = preparedSections;
    console.log(existingRole);
    await existingRole.save();

    // Respond with success
    res.status(200).json(ApiResponse.successUpdated(existingRole, "Role updated successfully"));

    } catch (error) {
        return next(ApiError.dataNotUpdated("Permission not Updated or Module not found"));
    }
});

const deleteRole = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  if (!name?.trim()) {
    return next(ApiError.validationFailed("Role name is required"));
  }

  const roleName = name.trim().toLowerCase();

  if (roleName === "super admin") {
    return next(ApiError.validationFailed("Cannot delete super admin role"));
  }
  const existingRole = await Role.findOne({
    name: roleName,
    isRoleDeleted: false,
  });

  if (!existingRole) {
    return next(ApiError.dataNotFound("Role with this name does not exists"));
  }
  console.log(existingRole);

  const countOfUser = await countNoOfUsersHavingRole(existingRole._id);
  if (countOfUser > 0) {
    return next(
      ApiError.validationFailed(
        "Cannot delete role as it is assigned to some users"
      )
    );
  }
  try {
    existingRole.isRoleDeleted = true;
    await existingRole.save();

    res
      .status(204)
      .json(
        ApiResponse.successDeleted(existingRole, "Role deleted successfully")
      );
  } catch (error) {
    return next(ApiError.dataNotDeleted("Role not deleted"));
  }
});

const fetchAllRole = asyncHandler(async (req, res, next) => {
  const roles = await Role.aggregate([
    {

      $match: {
        isRoleDeleted: false,
      },
    },

    {
      $addFields: {
        roleInfo: {
          name: "$name",
          createdAt: "$createdAt",
        },
      },
    },
    {
      $group: {
        _id: null,
        roles: { $push: "$roleInfo" },
      },
    },
    {
      $project: {
        _id: 0,
        roles: 1,
      },
    },
  ]);

  if (roles?.length === 0) {
    return res.status(200).json(ApiResponse.successRead([], "No roles found"));
  }

  res
    .status(200)
    .json(ApiResponse.successRead(roles[0], "data read successfull"));
});

export {
  createRole,
  updateRole,
  assignPermission,
  fetchPermission,
  deleteRole,
  fetchAllRole,
};
