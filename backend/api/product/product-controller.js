import "dotenv/config";
import { Product } from "./product-model.js";
import { Category } from "../product-category/product-category-model.js";
import { Inventory } from "../inventory/inventory-model.js";
import { Tax } from "./tax/tax-model.js";
import { ApiError } from "../../utils/api-error-utils.js";
import { ApiResponse } from "../../utils/api-Responnse-utils.js";
import { asyncHandler } from "../../utils/asyncHandler-utils.js";
import {
  uploadFile,
  deleteFromCloudinary,
  deleteFromLocalPath,
} from "../../utils/cloudinary-utils.js";

const createProduct = asyncHandler(async (req, res, next) => {
  console.log("-------------Creating Product-------------");
  let { name, skuCode, categoryName, salePrice, alertQuantity, taxName } =
    req.body;

  let discountType = req.body?.discountType === "rate" ? "rate" : "fixed";
  let discountValue =
    req.body?.discountValue !== 0 ? req.body?.discountValue : 0;

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
        ApiError.validationFailed(
          "Discount value cannot be more than sale price"
        )
      );
    }

    const tax = await Tax.findOne({ name: taxName, isTaxDeleted: false });
    if (!tax) {
      return next(ApiError.dataNotFound("Tax not found"));
    }

    const productImgUrl = await uploadFile(productImgLocalPath);
    if (productImgUrl === null) {
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
    return next(ApiError.dataNotInserted("Product not created"));
  } finally {
    if (productImgLocalPath) deleteFromLocalPath(productImgLocalPath);
  }
});

const updateProduct = asyncHandler(async (req, res, next) => {
  console.log("-------------Updating Product-------------");
    let skuCode = req.body?.skuCode; 
    if(!skuCode)
    {
      return next(ApiError.validationFailed("Sku code is required"));
    }
    skuCode = skuCode.trim().toLowerCase();
    const product = await Product.findOne({skuCode : skuCode});
    
    if(!product || product.isProductDeleted)
    {
      return next(ApiError.dataNotFound("Product does not exists or product is deleted"));
    }
      
    // let  newSkuCode = req.body?.newSkuCode?.toLowerCase() || skuCode;
    let name = req.body?.name?.toLowerCase(); 
    let categoryName = req.body?.categoryName?.toLowerCase();
    let salePrice = req.body?.salePrice;
    let alertQuantity = req.body?.alertQuantity;
    let taxName = req.body?.taxName?.toLowerCase();
    let discountType = req.body?.discountType === "rate" ? "rate" : "fixed";
    let discountValue = !(req.body?.discountValue)  ? 0 : req.body?.discountValue;
    
    if ([name, categoryName , taxName ].some((field) => !field?.trim()==="")) {
      return next(
        ApiError.validationFailed("Please provide all required fields")
      );
    }


  if (!product || product.isProductDeleted) {
    return next(
      ApiError.dataNotFound("Product does not exists or product is deleted")
    );
  }


    const tax = await Tax.findOne({name : taxName});
    if(!tax){
      return next(ApiError.dataNotFound("Tax Does not exists"));
    }

    const category = await Category.findOne({name : categoryName});
    if(!category){
        return next(ApiError.dataNotFound("Category Does not exists"));
    }
    try {
      product.name = name;
      product.category = category._id;
      product.salePrice = salePrice;
      product.alertQuantity = alertQuantity;
      product.taxRate = tax._id;
      product.discountType = discountType;
      product.discountValue = discountValue;

      await product.save();
      console.log(product);
      res.status(200).json(ApiResponse.successUpdated(product, "Product updated successfully"));

    console.log("----------------Product Updated Successfully----------------");
  } catch (error) {
    if (error.code === 11000) {
      return next(
        ApiError.validationFailed(
          "Duplicate key error -- Product  with the same skuCode already exists"
        )
      );
    }
    console.log(error);
    return next(ApiError.dataNotUpdated(error.message, error));
  }
});

const updateProductImage = asyncHandler(async (req, res, next) => {
  console.log("-------------Updating Product Image-------------");
  let skuCode = req.body?.skuCode;
  if (!skuCode.trim()) {
    return next(ApiError.validationFailed("Sku code is required"));
  }
  skuCode = skuCode.trim().toLowerCase();
  console.log(req.body);
  const productImgLocalPath = req.files?.productImg?.[0]?.path;
  if (!productImgLocalPath) {
    return next(ApiError.validationFailed("Product image is required"));
  }
  try {
      const product = await Product.findOne({skuCode : skuCode});
      if(!product){
        return next(ApiError.dataNotFound("Product does not exists"));
      }
      const oldProductImg = product.productImg;
      const productImgUrl = await uploadFile(productImgLocalPath);
      if(productImgUrl === null){
          return next(ApiError.dataNotUpdated("Product image not uploaded"));
      }
      console.log("Product Image URL: ", productImgUrl);

      
      product.productImg = productImgUrl;
      
      await product.save();

      await deleteFromCloudinary(oldProductImg);

      res.status(200).json(ApiResponse.successUpdated(product, "Product image updated successfully"));
      console.log("----------------Product Image Updated Successfully----------------");
    } catch (error) {
        console.log(error);
        return next(ApiError.dataNotUpdated("File not uploaded",error));
    }finally{
        if(productImgLocalPath)
          deleteFromLocalPath(productImgLocalPath);

    }   
});

const getStock = async (product_id) => {
  product_id = product_id.toString();
  console.log(product_id);
  const count = await Inventory.findOne({productId : product_id})
  if(count === null){
    return 0;
  }
  else{

    return count.totalQuantity;
  }
};

const deleteProduct = asyncHandler(async (req, res, next) => {
  console.log("-------------Deleting Product-------------");
  let { skuCode } = req.body;
  if (!skuCode) {
    return next(ApiError.validationFailed("Sku code is required"));
  }
  skuCode = skuCode.toLowerCase();
  const product = await Product.findOne({ skuCode, isProductDeleted: false });
  if (!product) {
    return next(ApiError.dataNotFound("Product does not exists"));
  }

  const countOfStock = await getStock(product._id);

    if(countOfStock > 0){
      return next(ApiError.validationFailed("Cannot delete product, stock exists"));
    }
    
    try{
        product.isProductDeleted = true;
        const ImageUrl = product.productImg;
        product.productImg = "NAN";
        await product.save();
        await deleteFromCloudinary(ImageUrl);
        console.log(product);
        res.status(204).json(ApiResponse.successDeleted(product, "Product deleted successfully"));
        console.log("----------------Product Deleted Successfully----------------");
    }catch(error){

    console.error(error);
    return next(ApiError.dataNotDeleted(error.message, error));
  }
});


// Change from GET to POST
const getProduct = asyncHandler(async (req, res, next) => {
  let { skuCode } = req.params; // Now we can use req.body

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

    res
      .status(200)
      .json(ApiResponse.successRead(product, "Product fetched successfully"));
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
        productInfo: {
          id: "$_id",
          name: "$name",
          skuCode: "$skuCode",
          productImg: "$productImg",
          salePrice: "$salePrice",
          alertQuantity: "$alertQuantity",
          discountType: "$discountType",
          discountValue: "$discountValue",
          category: { $arrayElemAt: ["$category.name", 0] },
          taxRate: { $arrayElemAt: ["$taxRate.percent", 0] },
        },
      },
    },
    {
      $group: {
        _id: null,
        product: { $push: "$productInfo" },
      },
    },
    {
      $project: {
        _id: 0,
        product: 1,
      },
    },
  ]);
  if(products.length === 0){
    return res.status(200).json(ApiResponse.successRead([], "No products Exists"));
  }
  res.status(200).json(ApiResponse.successRead(products, "Products fetched successfully"));

});

const fetchProductDropdown = asyncHandler(async (req, res, next) => {
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
      $addFields: {
        productInfo : {
          id : "$_id",
          name: "$name",
          skuCode: "$skuCode",
          category: { $arrayElemAt: ["$category.name", 0] },
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
  if(products.length === 0){
    return next(ApiError.dataNotFound("No products Exists"));
  }
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

const fetchProductDropdownForInvoice = asyncHandler(async (req, res, next) => {
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
        as: "tax",
      },
    },
    {
      $lookup: {
        from: "inventories",
        localField: "_id",
        foreignField: "productId",
        as: "inventory",
      },
    },
    {
      $unwind: { path: "$inventory", preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: { path: "$inventory.batches", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "batches",
        localField: "inventory.batches.batch",
        foreignField: "_id",
        as: "batch",
      },
    },
    {
      $unwind: { path: "$batch", preserveNullAndEmptyArrays: true },
    },
    {
      // Include products even if no batch exists
      $match: {
        $or: [{ "batch.isDeleted": false }, { "batch": null }], 
      },
    },
    {
      $group: {
        _id: "$_id",
        productInfo: {
          $first: {
            id: "$_id",
            name: "$name",
            skuCode: "$skuCode",
            category: { $arrayElemAt: ["$category.name", 0] },
            taxRate: { $arrayElemAt: ["$tax.percent", 0] },
            discountType: "$discountType",
            discountValue: "$discountValue",
            totalQuantity : "$inventory.totalQuantity",
          },
        },
        batches: {
          $push: {
            batchId: "$batch._id",
            batchNo: "$inventory.batches.batchNo",
            currentQuantity: "$batch.currentQuantity",
            totalQuantity: "$inventory.batches.totalQuantity",
            salePrice: "$batch.salePriceWithoutTax",
          },
        },
      },
    },
    {
      $addFields: {
        "productInfo.batches": {
          $cond: { if: { $eq: ["$batches.batchId", null] }, then: [], else: "$batches" },
        },
      },
    },
    {
      $group: {
        _id: null,
        products: { $push: "$productInfo" },
      },
    },
    {
      $project: {
        _id: 0,
        products: 1,
      },
    },
  ]);

  if (products.length === 0) {
    return next(ApiError.dataNotFound("No products exist"));
  }

  res.status(200).json(ApiResponse.successRead(products[0], "Products fetched successfully"));
});


export { 
  createProduct, 
  updateProduct,
  updateProductImage, 
  getProduct,
  fetchAllProduct, 
  getDiscountTypes,
  fetchProductDropdown, 
  fetchProductDropdownForInvoice,
  deleteProduct 
};

