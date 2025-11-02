const mongoose = require("mongoose");
const Item = require("../models/Item");
const { body, validationResult } = require("express-validator");

exports.getAllItems = async (req, res) => {
  try {
    const {
      search,
      category,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;
    let query = { tenantId: req.tenantId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { itemCode: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalItems = await Item.countDocuments(query);
    const items = await Item.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.json({
      items,
      totalItems,
      currentPage: pageNum,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createItem = [
  body("itemCode").notEmpty().withMessage("Item code is required"),
  body("name").notEmpty().withMessage("Name is required"),
  body("category").notEmpty().withMessage("Category is required"),
  body("grossWeight").isNumeric().withMessage("Gross weight must be a number"),
  body("netWeight").isNumeric().withMessage("Net weight must be a number"),
  body("source").notEmpty().withMessage("Source is required"),
  body("huid").notEmpty().withMessage("HUID is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const existingItem = await Item.findOne({ 
        itemCode: req.body.itemCode, 
        tenantId: req.tenantId 
      });
      if (existingItem) {
        return res.status(400).json({ message: "Item code already exists" });
      }

      const item = new Item({
        _id: new mongoose.Types.ObjectId(),
        ...req.body,
        images: req.files ? req.files.map((file) => file.filename) : [],
      });

      await item.save();
      res.status(201).json({ message: "Item created successfully", item });
    } catch (error) {
      console.error("Error creating item:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

exports.updateItem = [
  body("itemCode")
    .optional()
    .notEmpty()
    .withMessage("Item code cannot be empty"),
  body("name").optional().notEmpty().withMessage("Name cannot be empty"),
  body("category")
    .optional()
    .notEmpty()
    .withMessage("Category cannot be empty"),
  body("grossWeight")
    .optional()
    .isNumeric()
    .withMessage("Gross weight must be a number"),
  body("netWeight")
    .optional()
    .isNumeric()
    .withMessage("Net weight must be a number"),
  body("source").optional().notEmpty().withMessage("Source cannot be empty"),
  body("huid").optional().notEmpty().withMessage("HUID cannot be empty"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const item = await Item.findOne({ _id: req.params.id, tenantId: req.tenantId });
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      // Check if itemCode is being updated and if it conflicts
      if (req.body.itemCode && req.body.itemCode !== item.itemCode) {
        const existingItem = await Item.findOne({
          itemCode: req.body.itemCode,
          tenantId: req.tenantId,
        });
        if (existingItem) {
          return res.status(400).json({ message: "Item code already exists" });
        }
      }

      const updatedItem = await Item.findOneAndUpdate(
        { _id: req.params.id, tenantId: req.tenantId },
        {
          ...req.body,
          images: req.files
            ? [...item.images, ...req.files.map((file) => file.filename)]
            : item.images,
        },
        { new: true }
      );

      res.json({ message: "Item updated successfully", item: updatedItem });
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
