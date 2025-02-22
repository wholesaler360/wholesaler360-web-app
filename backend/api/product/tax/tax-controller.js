import 'dotenv/config';
import {Tax} from './tax-model.js'
import {Product} from '../product-model.js'
import { ApiError } from '../../../utils/api-error-utils.js';
import { ApiResponse } from '../../../utils/api-Responnse-utils.js';
import { asyncHandler } from '../../../utils/asyncHandler-utils.js';

const createTax = asyncHandler(async (req, res, next) => {
    let { name, percent } = req.body;
    if(!name || !percent && percent!==0 || (typeof percent !== 'number')) {
        return next(ApiError.validationFailed('Name and percent are required and percent should be a number'));
    }
    
    name = name.toLowerCase();
    const existingTax = await Tax.findOne( {name : name , isTaxDeleted : false});
    if(existingTax) {
        return next(ApiError.valueAlreadyExists('Tax already exists'));
    }
    
    try {
      const tax = new Tax({ name, percent });
      await tax.save();
      return res
        .status(201)
        .json(ApiResponse.successCreated(tax, "Tax created"));
    } catch (error) {
      return next(ApiError.dataNotInserted("Tax Not Created"));
    }
});

const updateTaxPercent = asyncHandler(async (req, res, next) => {
    let { name, percent } = req.body;
    if(!name || !percent && percent!==0 || (typeof percent !== 'number')) {
        return next(ApiError.validationFailed('Name and percent are required and percent should be a number'));
    }

    name = name.toLowerCase();
    const tax = await Tax.findOne({name : name , isTaxDeleted : false});
    if(!tax) {
        return next(ApiError.dataNotFound('Tax not found'));
    }

    tax.percent = percent;
    await tax.save();
    res.status(200).json(ApiResponse.successUpdated(tax, 'Tax updated successfully'));
});

const countNoOfProductsHavingTax = async (taxId) => {
    const count = await Product.countDocuments({ taxRate : taxId });
    return count;
};

const deleteTax = asyncHandler(async (req, res, next) => {
    let { name } = req.body;
    if(!name) {
        return next(ApiError.validationFailed('Name is required'));
    }

    name = name.toLowerCase();
    const tax = await Tax.findOne({name : name ,isTaxDeleted : false});
    if(!tax) {
        return next(ApiError.dataNotFound('Tax not does not exists'));
    }
    const countOfUser = await countNoOfProductsHavingTax(tax._id);
    if(countOfUser > 0)
    {
        return next(ApiError.validationFailed("Cannot delete tax as it is assigned to some products"));
    }
    try {
        tax.isTaxDeleted = true;
        await tax.save();
        res.status(204).json(ApiResponse.successDeleted(tax, 'Tax deleted successfully'));
    } catch (error) {
        return next(ApiError.dataNotInserted("Tax not deleted"));
    }
});

const getTax = asyncHandler(async (req, res, next) => {
    let {name} = req.params;
    if(!name) {
        return next(ApiError.validationFailed('Name is required'));
    }
    name = name.toLowerCase();
    const tax = await Tax.findOne({name : name , isTaxDeleted : false});
    if(!tax || tax.isTaxDeleted) {
        return next(ApiError.dataNotFound('Tax not found'));
    }
    res.status(200).json(ApiResponse.successRead(tax, 'Tax fetched successfully'));
});

const getAllTax = asyncHandler(async (req, res, next) => {
     const fetchTaxes = await Tax.aggregate([
            {
                $match: {
                    isTaxDeleted: false
                }
            },
            {
                $addFields: {
                    taxInfo: {
                        name: "$name",
                        percent: "$percent",
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    taxes: { $push: "$taxInfo" },
                }
            },
            {
                $project: {
                    _id: 0,
                    taxes: 1,
                }
            }
        ]);

        if(fetchTaxes.length <= 0) {
            return res.status(200).json(ApiResponse.successRead([], 'No taxes found'));
        }
        return res.status(200).json(ApiResponse.successRead(fetchTaxes[0], 'Taxes fetched successfully'));
});

export {createTax ,updateTaxPercent, deleteTax , getTax, getAllTax}