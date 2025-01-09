import { ApiError } from "../../utils/api-error-utils.js";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import {Module} from "./module-model.js"
import {asyncHandler} from "../../utils/asyncHandler.js"

const createModule = asyncHandler(async (req, res, next) => {
    const {name} = req.body;
    if(!name?.trim()){
        return next(new ApiError.validationFailed("Name is required"));
    }
    name.trim().toLowerCase();
    const module = await Module.create({name});

    res.status(200).json(ApiResponse.successCreated(module,"Module Created Successfully"))
});

export {createModule};