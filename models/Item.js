const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    itemCode: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    note: String,
    category: { type: String, required: true },
    grossWeight: { type: Number, required: true },
    netWeight: { type: Number, required: true },
    source: { type: String, required: true },
    huid: { type: String, required: true },
    images: [{ type: String, required: true }],
    stockQty: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
);

itemSchema.index({ tenantId: 1, itemCode: 1 }, { unique: true });

module.exports = mongoose.model("Item", itemSchema);
