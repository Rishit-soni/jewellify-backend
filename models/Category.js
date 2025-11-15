const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Ensure category name is unique per tenant
categorySchema.index({ tenantId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);
