const mongoose = require("mongoose");
const Order = require("../models/Order");
const Item = require("../models/Item");
const { body, validationResult } = require("express-validator");

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("customerId");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createOrder = [
  body("customerId").isMongoId().withMessage("Valid customer ID is required"),
  body("items")
    .isArray({ min: 1 })
    .withMessage("At least one item is required"),
  body("items.*.itemCode").notEmpty().withMessage("Item code is required"),
  body("items.*.qty")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  body("items.*.price").isNumeric().withMessage("Price must be a number"),
  body("totalWeight").isNumeric().withMessage("Total weight must be a number"),
  body("totalAmount").isNumeric().withMessage("Total amount must be a number"),
  body("payments").isArray().withMessage("Payments array is required"),
  body("payments.*.mode")
    .isIn(["Cash", "Online", "UPI"])
    .withMessage("Invalid payment mode"),
  body("payments.*.amount")
    .isNumeric()
    .withMessage("Payment amount must be a number"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Validate items exist and have sufficient stock
      for (const orderItem of req.body.items) {
        const item = await Item.findOne({ itemCode: orderItem.itemCode });
        if (!item) {
          return res
            .status(400)
            .json({ message: `Item ${orderItem.itemCode} not found` });
        }
        if (item.stockQty < orderItem.qty) {
          return res.status(400).json({
            message: `Insufficient stock for item ${orderItem.itemCode}. Available: ${item.stockQty}`,
          });
        }
      }

      const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        ...req.body,
      });

      await order.save();

      // Update item stock quantities
      for (const orderItem of req.body.items) {
        await Item.findOneAndUpdate(
          { itemCode: orderItem.itemCode },
          { $inc: { stockQty: -orderItem.qty } }
        );
      }

      res.status(201).json({ message: "Order created successfully", order });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

exports.updateOrderStatus = [
  body("status")
    .isIn(["Placed", "Processing", "Completed", "Cancelled"])
    .withMessage("Invalid status"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
      ).populate("customerId");

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json({ message: "Order status updated successfully", order });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];
