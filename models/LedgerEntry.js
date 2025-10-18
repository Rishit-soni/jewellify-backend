const mongoose = require("mongoose");

const ledgerEntrySchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    itemDetails: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["Credit", "Debit"], required: true },
    date: { type: Date, default: Date.now },
    note: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LedgerEntry", ledgerEntrySchema);
