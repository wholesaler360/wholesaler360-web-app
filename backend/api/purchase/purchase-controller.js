import { ApiError } from "../../utils/api-error-utils.js";
import { Purchase } from "../purchase/purchase-model.js";
import { Batch } from "../batch/batch-model.js";
import { addPurchaseStock } from "../inventory/inventory-controller.js";
import {asyncHandler} from "../../utils/async-handler.js";

const createPurchase = asyncHandler(async (req, res, next) => {
    
});