const mongoose = require("mongoose");
const Category = require("../models/Category");
const Item = require("../models/Item");
const { body, validationResult } = require("express-validator");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ tenantId: req.tenantId }).sort({
      name: 1,
    });
    res.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createCategory = [
  body("name")
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Category name must be between 1 and 50 characters")
    .trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const category = new Category({
        _id: new mongoose.Types.ObjectId(),
        tenantId: req.tenantId,
        name: req.body.name,
      });

      await category.save();
      res
        .status(201)
        .json({ message: "Category created successfully", category });
    } catch (error) {
      console.error("Error creating category:", error);
      if (error.code === 11000) {
        return res
          .status(400)
          .json({ message: "Category name already exists" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

exports.updateCategory = [
  body("name")
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Category name must be between 1 and 50 characters")
    .trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const category = await Category.findOne({
        _id: req.params.id,
        tenantId: req.tenantId,
      });
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const oldName = category.name;
      const newName = req.body.name;

      // Check if the new name conflicts with existing categories
      if (oldName !== newName) {
        const existingCategory = await Category.findOne({
          tenantId: req.tenantId,
          name: newName,
        });
        if (existingCategory) {
          return res
            .status(400)
            .json({ message: "Category name already exists" });
        }
      }

      // Update the category
      category.name = newName;
      await category.save();

      // Cascade update all items with the old category ObjectId
      await Item.updateMany(
        { tenantId: req.tenantId, category: category._id },
        { category: category._id } // Keep the same ObjectId, no change needed since name is in Category model
      );

      res.json({ message: "Category updated successfully", category });
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if any items exist with this category
    const itemCount = await Item.countDocuments({
      tenantId: req.tenantId,
      category: category._id,
    });

    if (itemCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. ${itemCount} item(s) are associated with this category.`,
      });
    }

    await Category.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId,
    });
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
