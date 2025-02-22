import { ApiError } from "../../utils/api-error-utils.js";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import {Category} from './product-category-model.js'
import {Product} from '../product/product-model.js'

const createCategory = asyncHandler(async(req,res,next)=>{
    let {name} = req.body;
    if(!(name?.trim())){
        return next(ApiError.validationFailed("Category name is required"));
    }
    
    name = name.trim().toLowerCase();
    const existingCategory = await Category.findOne({name , isCategoryDeleted:false});
    if(existingCategory ){
        return next(ApiError.valueAlreadyExists("Category with this name already exists"));
    }

    try {
      const category = new Category({ name });
      await category.save();
      return res
        .status(201)
        .json(
          ApiResponse.successCreated(category, "Category created successfully")
        );
    } catch (error) {
      return next(ApiError.dataNotInserted("Category not created"));
    }
});

const updateCategory = asyncHandler(async(req,res,next)=>{
    let {name , newName} = req.body;
    if(!(name?.trim()) || !(newName?.trim())){
        return next(ApiError.validationFailed("Category name is required"));
    }

    name = name.trim().toLowerCase();
    newName = newName.trim().toLowerCase();

    const category = await Category.findOne({name , isCategoryDeleted:false});
    if(!category){
        return next(ApiError.dataNotFound("Category not found"));
    }

    const existingCategory = await Category.findOne({name:newName , isCategoryDeleted:false});
    if(existingCategory){
        return next(ApiError.valueAlreadyExists("Category with this name already exists"));
    }

    try {
      category.name = newName;
      await category.save();
      return res
        .status(200)
        .json(
          ApiResponse.successUpdated(category, "Category updated successfully")
        );
    } catch (error) {
      return next(ApiError.dataNotInserted("Category not updated"));
    }
    
});

const countNoOfProductsHavingCategory = async (categoryId) => {
    const count = await Product.countDocuments({ category : categoryId });
    return count;
};

const deleteCategory = asyncHandler(async(req,res,next)=>{
    let {name} = req.body;
    if(!(name?.trim())){
        return next(ApiError.validationFailed("Category name is required"));
    }
    name = name.trim().toLowerCase();
    const category = await Category.findOne({name , isCategoryDeleted:false});
    if(!category){
        return next(ApiError.dataNotFound("Category not found"));
    }
    const countOfUser = await countNoOfProductsHavingCategory(category._id);
    if(countOfUser > 0)
    {
        return next(ApiError.validationFailed("Cannot delete category as it is assigned to some products"));
    }
    try {
        category.isCategoryDeleted = true;
        await category.save();
        return res.status(204).json(ApiResponse.successDeleted(category,"Category deleted successfully"));
    } catch (error) {
        return next(ApiError.dataNotDeleted("Category not deleted"));
    }
});
const getCategory = asyncHandler(async(req,res,next)=>{
    let { name } = req.params;
    if(!(name?.trim())){
        return next(ApiError.validationFailed("Category name is required"));
    }
    name = name.trim().toLowerCase();
    const fetchCategory = await Category.findOne({name , isCategoryDeleted:false});
    if(!fetchCategory)
    {
        return next(ApiError.dataNotFound("Category not found"));
    }
    return res.status(200).json(ApiResponse.successRead(fetchCategory,"Category fetched successfully"));
    
})
const getAllCategories = asyncHandler(async(req,res,next)=>{
    const fetchCategories = await Category.aggregate([
                {
                    $match: {
                        isCategoryDeleted: false
                    }
                },
                {
                    $addFields: {
                        categoryInfo: {
                            name: "$name",
                            createdAt: "$createdAt"
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        categories: { $push: "$categoryInfo" },
                    }
                },
                {
                    $project: {
                        _id: 0,
                        categories: 1,
                    }
                }
            ]);
    
            if(fetchCategories <= 0) {
                return next(ApiError.dataNotFound('No Categories found'));
            }
            return res.status(200).json(ApiResponse.successRead(fetchCategories[0], 'Categories fetched successfully'));

});
export {createCategory ,updateCategory ,deleteCategory , getCategory , getAllCategories};