import mongoose, { Schema } from "mongoose";

const batchSchema = new Schema(
  {
    purchaseId: {
      type: Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
    },
    currentQuantity: {
      type: Number,
      required: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
    },
    salePriceWithoutTax: {
      type: Number,
      required: true,
      default: 0,
    },
    isSalePriceEntered: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Batch = mongoose.model("Batch", batchSchema);
