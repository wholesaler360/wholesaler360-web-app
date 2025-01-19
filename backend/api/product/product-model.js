import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    skuCode: {
      type: String,
      unique: true,
      required: true,
    },
    productImg: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    salePrice: {
      type: Number,
      required: true,
    },
    alertQuantity: {
      type: Number,
      required: true,
      default: 5,
    },
    taxRate: {
      type: Schema.Types.ObjectId,
      ref : "Tax",
      required: true,
      default: 0,
    },
    discountType: {
      type: String,
      enum: ["fixed", "rate"],
      default: "fixed",
    },
    discountValue: {
      type: Number,
      required: true,
      default: 0,
    },
    isProductDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
