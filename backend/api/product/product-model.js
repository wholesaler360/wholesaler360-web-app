import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
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
    },
    discountValue: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Array,
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

export const User = mongoose.model("Product", productSchema);
