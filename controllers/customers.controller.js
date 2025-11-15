const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const { body, validationResult } = require("express-validator");

exports.getAllCustomers = async (req, res) => {
  try {
    const {
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;
    let query = { tenantId: req.tenantId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalCustomers = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(totalCustomers / limitNum);

    res.json({
      customers,
      totalCustomers,
      currentPage: pageNum,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    });
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
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId,
    });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCustomerDetails = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Get recent orders (last 10)
    const recentOrders = await mongoose.connection.db
      .collection("orders")
      .aggregate([
        { $match: { customerId: customer._id, tenantId: req.tenantId } },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "items",
            localField: "items.itemCode",
            foreignField: "itemCode",
            as: "itemDetails",
          },
        },
        {
          $project: {
            _id: 1,
            items: 1,
            totalWeight: 1,
            totalAmount: 1,
            status: 1,
            date: 1,
            payments: 1,
            createdAt: 1,
            itemDetails: {
              $map: {
                input: "$itemDetails",
                as: "item",
                in: {
                  itemCode: "$$item.itemCode",
                  name: "$$item.name",
                  category: "$$item.category",
                },
              },
            },
          },
        },
      ])
      .toArray();

    // Calculate outstanding payments
    const allOrders = await mongoose.connection.db
      .collection("orders")
      .aggregate([
        { $match: { customerId: customer._id, tenantId: req.tenantId } },
        {
          $group: {
            _id: null,
            totalOrdered: { $sum: "$totalAmount" },
            totalPaid: { $sum: { $sum: "$payments.amount" } },
          },
        },
      ])
      .toArray();

    const outstandingAmount =
      allOrders.length > 0
        ? allOrders[0].totalOrdered - allOrders[0].totalPaid
        : 0;

    // Get transaction history (ledger entries)
    const transactionHistory = await mongoose.connection.db
      .collection("ledgerentries")
      .aggregate([
        { $match: { customerId: customer._id, tenantId: req.tenantId } },
        { $sort: { date: -1 } },
        { $limit: 20 },
        {
          $project: {
            _id: 1,
            itemDetails: 1,
            amount: 1,
            type: 1,
            date: 1,
            note: 1,
            createdAt: 1,
          },
        },
      ])
      .toArray();

    // Get order statistics
    const orderStats = await mongoose.connection.db
      .collection("orders")
      .aggregate([
        { $match: { customerId: customer._id, tenantId: req.tenantId } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalOrderValue: { $sum: "$totalAmount" },
            completedOrders: {
              $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
            },
            pendingOrders: {
              $sum: {
                $cond: [{ $in: ["$status", ["Placed", "Processing"]] }, 1, 0],
              },
            },
          },
        },
      ])
      .toArray();

    const stats =
      orderStats.length > 0
        ? orderStats[0]
        : {
            totalOrders: 0,
            totalOrderValue: 0,
            completedOrders: 0,
            pendingOrders: 0,
          };

    res.json({
      customer,
      recentOrders,
      outstandingAmount,
      transactionHistory,
      statistics: {
        totalOrders: stats.totalOrders,
        totalOrderValue: stats.totalOrderValue,
        completedOrders: stats.completedOrders,
        pendingOrders: stats.pendingOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching customer details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
