import "dotenv/config";
import { Product } from "./product-model.js";
import { Category } from "../product-category/product-category-model.js";
import { Tax } from "./tax/tax-model.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import {uploadFile  , deleteFromCloudinary , deleteFromLocalPath,} from "../../utils/cloudinary-utils.js";

const createProduct = asyncHandler(async (req, res, next) => {
  console.log("-------------Creating Product-------------");
  let { name, skuCode, categoryName, salePrice, alertQuantity, taxName } =
    req.body;

  let discountType = req.body?.discountType === "rate" ? "rate" : "fixed";
  console.log(discountType);
  let discountValue =
    req.body?.discountValue !== 0 ? 0 : req.body?.discountType;

  console.log(discountValue);

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

  //    Validation part

  const product = await Product.findOne({
    skuCode: skuCode,
    isProductDeleted: false,
  });

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

  const productImgLocalPath = req.files?.productImg[0]?.path;
  if (!productImgLocalPath) {
    return next(ApiError.validationFailed("Product image is required"));
  }

  try {
    const productImgUrl = await uploadFile(productImgLocalPath);

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
    return next(ApiError.dataNotInserted("Product not created"))
  } finally {
    if (productImgLocalPath) 
        deleteFromLocalPath(productImgLocalPath);
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

export { createProduct, fetchAllProduct, getDiscountTypes };
