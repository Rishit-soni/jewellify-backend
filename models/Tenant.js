const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    businessName: { type: String, required: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String },
    gstNumber: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tenant", tenantSchema);
