const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ tenantId: req.tenantId }).select(
      "-password"
    );
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createUser = [
  body("userName").notEmpty().withMessage("User name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .isIn(["Manager", "Staff"])
    .withMessage("Role must be Manager or Staff"),
  body("phone").optional(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { userName, email, password, role, phone } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        _id: new mongoose.Types.ObjectId(),
        tenantId: req.tenantId,
        userName,
        email,
        password: hashedPassword,
        phone,
        role,
      });

      await newUser.save();

      const userResponse = newUser.toObject();
      delete userResponse.password;

      res.status(201).json({
        message: "User created successfully",
        user: userResponse,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];
