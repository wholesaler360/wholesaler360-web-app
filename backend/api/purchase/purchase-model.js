import mongoose, { Schema } from "mongoose";

const purchaseSchema = new Schema(
    {
        purchaseNo: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            index: true,
            unique: true,
        },
        purchaseDate: {
            type: Date,
            required: true,
        },
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },
        products: [{
            id: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            unitPrice: {
                type: Number,
                required: true,
            },
            taxRate: {
                type: Number,
                required: true,
            },
            taxAmount: {
                type: Number,
            },
            amount: {
                type: Number,
            }
        }],
        totalTax: {
            type: Number,
        },
        totalAmount: {
            type: Number,
        },
        transactionType: {
            type: String,
            enum: ["debit", "credit"],
            required: true,
        },
        paymentMode: {
            type: String,
            enum: ['cash', 'cheque', 'upi', 'online', 'N/A'],
        },
        initialPayment: {
            type: Number,
            required: true,
            default: 0,
        },
        description: {
            type: String,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        isPurchaseReturn: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },  
    { timestamps: true }
);


// Middleware to calculate taxAmount and amount for each product
purchaseSchema.pre('save', function (next) {
    this.products.forEach(product => {
        product.taxAmount = (product.price * product.quantity) * product.taxRate / 100;
        product.amount = (product.price * product.quantity) + product.taxAmount;
    });
  
    this.totalTax = this.products.reduce((acc, product) => acc + product.taxAmount, 0);
    this.totalAmount = this.products.reduce((acc, product) => acc + product.amount, 0);
  
    next();
});

export const Purchase = mongoose.model("Purchase", purchaseSchema);