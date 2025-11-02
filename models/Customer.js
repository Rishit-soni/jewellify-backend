const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    panNumber: { type: String },
    note: { type: String },
  },
  { timestamps: true }
);

customerSchema.index({ tenantId: 1, phone: 1 });

module.exports = mongoose.model("Customer", customerSchema);
