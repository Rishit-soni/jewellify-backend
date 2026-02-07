const mongoose = require("mongoose");
const Item = require("../models/Item");
const Category = require("../models/Category");
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
      query.category = category.trim();
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
    const item = await Item.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    });
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
  body("name").notEmpty().withMessage("Name is required"),
  body("category").notEmpty().withMessage("Category is required"),
  body("grossWeight").isNumeric().withMessage("Gross weight must be a number"),
  body("netWeight").isNumeric().withMessage("Net weight must be a number"),
  body("source").notEmpty().withMessage("Source is required"),
  body("huid").notEmpty().withMessage("HUID is required"),
  body("labour.mode")
    .notEmpty()
    .withMessage("Labour mode is required")
    .isIn(["percentage_per_gram", "rupees_per_gram", "fixed_amount"])
    .withMessage(
      "Invalid labour mode. Must be one of: percentage_per_gram, rupees_per_gram, fixed_amount"
    ),
  body("otherCharges")
    .optional()
    .customSanitizer((val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch (e) {
          return val;
        }
      }
      return val;
    })
    .isArray()
    .withMessage("Other charges must be an array"),
  body("otherCharges.*.name")
    .optional()
    .notEmpty()
    .withMessage("Charge name is required"),
  body("otherCharges.*.amount")
    .optional()
    .isNumeric()
    .withMessage("Charge amount must be a number"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Validate that the category exists for the tenant
      const categoryExists = await Category.findOne({
        name: req.body.category,
        tenantId: req.tenantId,
      });
      if (!categoryExists) {
        return res.status(400).json({ message: "Invalid category" });
      }

      const body = { ...req.body };
      const labour = {
        mode: body["labour.mode"],
        amount: body["labour.amount"],
      };
      delete body["labour.mode"];
      delete body["labour.amount"];

      if (body.otherCharges && typeof body.otherCharges === "string") {
        body.otherCharges = JSON.parse(body.otherCharges);
      }

      // Validate image count (max 5 images)
      const imageCount = req.files ? req.files.length : 0;
      if (imageCount > 5) {
        return res.status(400).json({ 
          message: "Maximum 5 images allowed per item",
          currentCount: imageCount 
        });
      }

      const item = new Item({
        _id: new mongoose.Types.ObjectId(),
        tenantId: req.tenantId,
        ...body,
        labour,
        images: req.files ? req.files.map((file) => file.path) : [], // Use file.path for Cloudinary URLs
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
  body("labour.mode")
    .optional()
    .isIn(["percentage_per_gram", "rupees_per_gram", "fixed_amount"])
    .withMessage(
      "Invalid labour mode. Must be one of: percentage_per_gram, rupees_per_gram, fixed_amount"
    ),
  body("labour.amount")
    .optional()
    .isNumeric()
    .withMessage("Labour amount must be a number"),
  body("otherCharges")
    .optional()
    .customSanitizer((val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch (e) {
          return val;
        }
      }
      return val;
    })
    .isArray()
    .withMessage("Other charges must be an array"),
  body("otherCharges.*.name")
    .optional()
    .notEmpty()
    .withMessage("Charge name is required"),
  body("otherCharges.*.amount")
    .optional()
    .isNumeric()
    .withMessage("Charge amount must be a number"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const item = await Item.findOne({
        _id: req.params.id,
        tenantId: req.tenantId,
      });
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      // Validate category if being updated
      if (req.body.category && req.body.category !== item.category) {
        const categoryExists = await Category.findOne({
          name: req.body.category,
          tenantId: req.tenantId,
        });
        if (!categoryExists) {
          return res.status(400).json({ message: "Invalid category" });
        }
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

      const body = { ...req.body };
      if (body["labour.mode"] && body["labour.amount"]) {
        const labour = {
          mode: body["labour.mode"],
          amount: body["labour.amount"],
        };
        delete body["labour.mode"];
        delete body["labour.amount"];
        body.labour = labour;
      }

      if (body.otherCharges && typeof body.otherCharges === "string") {
        body.otherCharges = JSON.parse(body.otherCharges);
      }

      // Validate total image count (existing + new images should not exceed 5)
      const newImageCount = req.files ? req.files.length : 0;
      const totalImageCount = item.images.length + newImageCount;
      if (totalImageCount > 5) {
        return res.status(400).json({ 
          message: "Maximum 5 images allowed per item",
          currentCount: item.images.length,
          attemptingToAdd: newImageCount,
          totalWouldBe: totalImageCount
        });
      }

      const updatedItem = await Item.findOneAndUpdate(
        { _id: req.params.id, tenantId: req.tenantId },
        {
          ...body,
          images: req.files
            ? [...item.images, ...req.files.map((file) => file.path)] // Use file.path for Cloudinary URLs
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
    const item = await Item.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    });
    
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Delete images from Cloudinary if they exist
    if (item.images && item.images.length > 0) {
      try {
        const { deleteImages } = require("../utils/cloudinary");
        await deleteImages(item.images);
        console.log(`Deleted ${item.images.length} images from Cloudinary for item ${item._id}`);
      } catch (cloudinaryError) {
        console.error("Error deleting images from Cloudinary:", cloudinaryError);
        // Continue with item deletion even if Cloudinary deletion fails
      }
    }

    // Delete the item from database
    await Item.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId,
    });

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete a specific image from an item
 * DELETE /api/items/:id/images
 * Body: { imageUrl: "cloudinary_url" }
 */
exports.deleteItemImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    const item = await Item.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if the image exists in the item
    const imageIndex = item.images.indexOf(imageUrl);
    if (imageIndex === -1) {
      return res.status(404).json({ message: "Image not found in this item" });
    }

    // Delete image from Cloudinary
    try {
      const { deleteImage } = require("../utils/cloudinary");
      await deleteImage(imageUrl);
      console.log(`Deleted image from Cloudinary: ${imageUrl}`);
    } catch (cloudinaryError) {
      console.error("Error deleting image from Cloudinary:", cloudinaryError);
      // Continue with database update even if Cloudinary deletion fails
    }

    // Remove image from item's images array
    item.images.splice(imageIndex, 1);
    await item.save();

    res.json({ 
      message: "Image deleted successfully",
      remainingImages: item.images.length,
      item 
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
