import mongoose, { Schema } from "mongoose";

const InvoiceSchema = new Schema(
  {
    invoiceId: {
      type: String,
      required: true,
      unique: true,
      trim : true,
    }
  },
  { timestamps: true }
);

export const Invoice = mongoose.model("Invoice", InvoiceSchema);
