const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    itemCode: { type: String },
    name: { type: String, required: true },
    description: String,
    note: String,
    category: { type: String, required: true },
    grossWeight: { type: Number, required: true },
    netWeight: { type: Number, required: true },
    otherCharges: [
      {
        name: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
      },
    ],
    source: { type: String, required: true },
    huid: { type: String, required: true },
    images: [{ type: String, required: true }],
  },
  { timestamps: true }
);

itemSchema.index({ tenantId: 1, itemCode: 1 }, { unique: true });

const getCategoryPrefix = (categoryName) => {
  if (!categoryName) return "XX";

  const words = categoryName.split(" ");
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return categoryName.substring(0, 2).toUpperCase();
};

itemSchema.pre("save", async function (next) {
  if (this.isNew && !this.itemCode) {
    try {
      const prefix = getCategoryPrefix(this.category);
      const lastItem = await this.constructor
        .findOne({
          tenantId: this.tenantId,
          itemCode: { $regex: `^${prefix}` },
        })
        .sort({ itemCode: -1 })
        .limit(1);

      let nextNumber = 1;
      if (lastItem && lastItem.itemCode) {
        const lastNumber = parseInt(lastItem.itemCode.replace(prefix, ""));
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }

      this.itemCode = `${prefix}${String(nextNumber).padStart(2, "0")}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model("Item", itemSchema);
