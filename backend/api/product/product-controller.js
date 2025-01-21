import "dotenv/config";
import { Product } from "./product-model.js";
import { Category } from "../product-category/product-category-model.js";
import { Inventory } from "../inventory/inventory-model.js";
import { Tax } from "./tax/tax-model.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import {uploadFile  , deleteFromCloudinary , deleteFromLocalPath} from "../../utils/cloudinary-utils.js";

const createProduct = asyncHandler(async (req, res, next) => {
  console.log("-------------Creating Product-------------");
  let { name, skuCode, categoryName, salePrice, alertQuantity, taxName } = req.body;

  let discountType = req.body?.discountType === "rate" ? "rate" : "fixed";
  let discountValue = req.body?.discountValue !== 0 ? req.body?.discountValue : 0;

  if (
    [name, skuCode, categoryName, salePrice, alertQuantity, taxName].some(
      (field) => !field?.trim()
    )
  ) {
    return next(
      ApiError.validationFailed("Please provide all required fields")
    );
  }

  name = name.toLowerCase();
  skuCode = skuCode.toLowerCase();
  categoryName = categoryName.toLowerCase();
  taxName = taxName.toLowerCase();
  const productImgLocalPath = req.files?.productImg[0]?.path;
  if (!productImgLocalPath) {
    return next(ApiError.validationFailed("Product image is required"));
  }
  
  //    Validation part
  const product = await Product.findOne({
    skuCode: skuCode,
  });
  
  try {
    if (product) {
      return next(ApiError.validationFailed("Product already exists"));
    }

    const category = await Category.findOne({
      name: categoryName,
      isCategoryDeleted: false,
    });
    if (!category) {
      return next(ApiError.dataNotFound("Category not found"));
    }

    if (!(discountType === "fixed" || discountType === "rate")) {
      return next(ApiError.validationFailed("Invalid discount type"));
    }
    if (discountType === "rate" && discountValue > 100) {
      return next(
        ApiError.validationFailed("Discount value cannot be more than 100%")
      );
    } else if (discountType === "fixed" && discountValue > salePrice) {
      return next(
        ApiError.validationFailed("Discount value cannot be more than sale price")
      );
    }

    const tax = await Tax.findOne({ name: taxName, isTaxDeleted: false });
    if (!tax) {
      return next(ApiError.dataNotFound("Tax not found"));
    }


    const productImgUrl = await uploadFile(productImgLocalPath);
    if(productImgUrl === null){
      return next(ApiError.dataNotInserted("Product image not uploaded"));
    }
    console.log("Product Image URL: ", productImgUrl);

    const newProduct = await Product.create({
      name,
      skuCode,
      productImg: productImgUrl,
      category: category._id,
      salePrice,
      alertQuantity,
      taxRate: tax._id,
      discountType,
      discountValue,
    });
    console.log(newProduct);
    res
      .status(201)
      .json(
        ApiResponse.successCreated(newProduct, "Product created successfully")
      );
    console.log("-------------Product Created Successfully-------------");
  } catch (error) {
    deleteFromCloudinary(productImgUrl);
    console.log(error);
    return next(ApiError.dataNotInserted("Product not created"))
  } finally {
    if (productImgLocalPath) 
        deleteFromLocalPath(productImgLocalPath);
  }
});

const updateProduct = asyncHandler(async (req , res , next)=>{
    let name = req.body?.name;
    let skuCode = req.body?.skuCode;
    let categoryName = req.body?.categoryName;
    let salePrice = req.body?.salePrice;
    let alertQuantity = req.body?.alertQuantity;
    let taxName = req.body?.taxName;
    let discountType = req.body?.discountType === "rate" ? "rate" : "fixed";
    let discountValue = req.body?.discountValue !== 0 ? req.body?.discountValue : 0;

    if (
      [name, skuCode, categoryName, salePrice, alertQuantity, taxName].some(
        (field) => !field?.trim()
      )
    ) {
      return next(
        ApiError.validationFailed("Please provide all required fields")
      );
    }

    name = name.toLowerCase();
    skuCode = skuCode.toLowerCase();
    categoryName = categoryName.toLowerCase();
    taxName = taxName.toLowerCase();

    
});

const getStock = async (product_id) => {
  const count = await Inventory.countDocuments({ product: product_id });
  return count;
};

const deleteProduct = asyncHandler(async (req, res, next) => {
console.log("-------------Deleting Product-------------");
    let { skuCode } = req.body;
    if (!skuCode) {
        return next(ApiError.validationFailed("Sku code is required"));
    }
    skuCode = skuCode.toLowerCase();
    const product = await Product.findOne({ skuCode , isProductDeleted: false });
    if (!product) {
      return next(ApiError.dataNotFound("Product does not exists"));
    }

    // const countOfStock = await getStock(product._id);
    
    // if(countOfStock > 0){
    //   return next(ApiError.validationFailed("Cannot delete product, stock exists"));
    // }
    
    try{
        product.isProductDeleted = true;
        await product.save();
        console.log(product);
        res.status(204).json(ApiResponse.successDeleted(product, "Product deleted successfully"));
        console.log("----------------Product Deleted Successfully----------------");
    }catch(error){
    console.error(error);
        return next(ApiError.dataNotDeleted(error.message, error));
    }
});

const getProduct = asyncHandler(async (req, res, next) => {
  let { skuCode } = req.body;
  if (!skuCode) {
    return next(ApiError.validationFailed("Sku code is required"));
  }

  skuCode = skuCode.toLowerCase();
  try {
  const product = await Product.findOne({ skuCode, isProductDeleted: false })
    ?.populate({
      path: "category",
      select: "-_id -isCategoryDeleted -__v -createdAt -updatedAt",
    })
    .populate({
      path: "taxRate",
      select: "-_id -isTaxDeleted -__v -createdAt -updatedAt",
    });
  if (!product) {
    return next(ApiError.dataNotFound("Product does not exists"));
  }

  res.status(200).json(ApiResponse.successRead(product, "Product fetched successfully"));
  } catch (error) {
    return next(ApiError.dataNotFound(error.message, error));
  }
});

const fetchAllProduct = asyncHandler(async (req, res, next) => {
  const products = await Product.aggregate([
    {
      $match: { isProductDeleted: false },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $lookup: {
        from: "taxes",
        localField: "taxRate",
        foreignField: "_id",
        as: "taxRate",
      },
    },
    {
      $addFields: {
        productInfo : {
          name: "$name",
          skuCode: "$skuCode",
          productImg: "$productImg",
          salePrice: "$salePrice",
          alertQuantity: "$alertQuantity",
          discountType: "$discountType",
          discountValue: "$discountValue",
          category: { $arrayElemAt: ["$category.name", 0] },
          taxRate: { $arrayElemAt: ["$taxRate.percent", 0] },
        }
      }
    },
    {
      $group: {
        _id: null,
        product: { $push: "$productInfo" },
      }
    },
    {
      $project: {
        _id: 0,
        product: 1,
      },
    },
  ]);
  res.status(200).json(ApiResponse.successRead(products[0], "Products fetched successfully"));
});

const getDiscountTypes = asyncHandler(async (req, res, next) => {
  try {
    const discountTypes = Product.schema.path("discountType").enumValues;
    res
      .status(200)
      .json(
        ApiResponse.successRead(
          discountTypes,
          "Discount types fetched successfully"
        )
      );
  } catch (error) {
    return next(ApiError.dataNotFound(error.message, error));
  }
});

export { createProduct, getProduct ,fetchAllProduct, getDiscountTypes , deleteProduct };
