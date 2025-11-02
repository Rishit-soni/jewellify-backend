const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const { body, validationResult } = require("express-validator");

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ tenantId: req.tenantId }).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createCustomer = [
  body("name").notEmpty().withMessage("Name is required"),
  body("phone").notEmpty().withMessage("Phone is required"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const customer = new Customer({
        _id: new mongoose.Types.ObjectId(),
        ...req.body,
      });

      await customer.save();
      res
        .status(201)
        .json({ message: "Customer created successfully", customer });
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

exports.updateCustomer = [
  body("name").optional().notEmpty().withMessage("Name cannot be empty"),
  body("phone").optional().notEmpty().withMessage("Phone cannot be empty"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const customer = await Customer.findOneAndUpdate(
        { _id: req.params.id, tenantId: req.tenantId },
        req.body,
        {
          new: true,
        }
      );
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json({ message: "Customer updated successfully", customer });
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
