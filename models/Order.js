const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: [
      {
        itemCode: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalWeight: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Placed", "Processing", "Completed", "Cancelled"],
      default: "Placed",
    },
    date: { type: Date, default: Date.now },
    payments: [
      {
        mode: { type: String, enum: ["Cash", "Online", "UPI"], required: true },
        amount: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

orderSchema.index({ tenantId: 1, customerId: 1 });

module.exports = mongoose.model("Order", orderSchema);
