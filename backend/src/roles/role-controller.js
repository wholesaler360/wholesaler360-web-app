import { Role } from "./role-model.js";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Module } from "../sections/module-model.js";

const createRole = asyncHandler(async (req, res, next) => {
    const {name} = req.body;
    if (!name?.trim()) {
        return next(ApiError.validationFailed("Role name is required"));
    }

    name.trim().toLowerCase();

    const existingRole = await Role.findOne({ name });

    if (existingRole || !(existingRole?.isRoleDeleted)) {
        return next(ApiError.valueAlreadyExists("Role with this name already exists"));
    }

    const fetchedModule = await Module.findOne({name : "dashboard"})
    try {
        const role = new Role({
            name: name.trim().toLowerCase(),
            sections : [{module : fetchedModule._id, permission : 8}],
        });

        await role.save();

        // Respond with success
        res.status(201).json(ApiResponse.successCreated(role, "Role created successfully"));
    } catch (error) {   
        
    }
});

const fetchPermission = asyncHandler(async (req,res,next) => {
    const {name} = req.body;
    if (!name?.trim()) {
        return next(ApiError.validationFailed("Role name is required"));
    }

    name.trim().toLowerCase();

    const existingRole = await Role.findOne({name})
    .populate({
        path: "sections.module",
        select: "-__v -createdAt -updatedAt", // Exclude fields from populated documents
    })
    .select("-createdAt -updatedAt -sections._id -__v"); // Exclude fields from the main query

    if (!existingRole || existingRole?.isRoleDeleted) {    
        return next(ApiError.dataNotFound("Role with this name does not exists"));
    }
    res.status(200).json(ApiResponse.successRead(existingRole, "Role fetched successfully"));

});

const assignPermission = asyncHandler(async (req, res, next) => {
    const { name, sections } = req.body;

    if (!name?.trim()) {
        return next(ApiError.validationFailed("Role name is required"));
    }

    if (sections && !Array.isArray(sections)) {
        return next(ApiError.validationFailed("Sections must be an array"));
    }
    name.trim().toLowerCase();
    const existingRole = await Role.findOne({ name });

    if (!existingRole || existingRole.isRoleDeleted) {
        return next(ApiError.dataNotFound("Role with this name does not exists"));
    }

    try {
        // Prepare sections for update
        const preparedSections = await Promise.all(
            sections.map(async (section) => {
                if (!section.module || section.permission === undefined) {
                    throw ApiError.validationFailed("Invalid section data");
                }

                // Check if the module exists
                const moduleDoc = await Module.findOne({ name : section.module });
                if (!moduleDoc) {
                    throw ApiError.dataNotFound(`${section.module} does not exist`);
                }
                return {
                    module: moduleDoc._id,
                    permission: parseInt(section.permission, 10),
                };
            })
        );

    // Update the role with the prepared sections
    existingRole.sections = preparedSections;
    await existingRole.save();

    // Respond with success
    res.status(201).json(ApiResponse.successUpdated(existingRole, "Role updated successfully"));

    } catch (error) {
        return next(new ApiError(500, error.message));
    }
});

const deleteRole = asyncHandler(async (req, res, next) => {
    const { name } = req.body;

    if (!name?.trim()) {
        return next(ApiError.validationFailed("Role name is required"));
    }

    const roleName = name.trim().toLowerCase();
    const existingRole = await Role.findOne({ name: roleName });

    if (!existingRole || existingRole.isRoleDeleted) {
        return next(ApiError.dataNotFound("Role with this name does not exists"));
    }

    console.log(existingRole);

    try {
        existingRole.isRoleDeleted = true;
        await existingRole.save();

        res.status(204).json(ApiResponse.successDeleted(existingRole, "Role deleted successfully"));
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
});

export { createRole , assignPermission, fetchPermission, deleteRole };
