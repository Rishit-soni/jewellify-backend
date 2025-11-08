const mongoose = require("mongoose");
const User = require("../models/user");
const Tenant = require("../models/Tenant");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

exports.register = [
  body("userName").notEmpty().withMessage("Username is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("businessName").notEmpty().withMessage("Business name is required"),
  body("ownerName").notEmpty().withMessage("Owner name is required"),
  body("phone").notEmpty().withMessage("Phone number is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userName, email, password, role, businessName, ownerName, phone, address, gstNumber } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const existingTenant = await Tenant.findOne({ email });
      if (existingTenant) {
        return res.status(400).json({ message: "Business already registered with this email" });
      }

      const tenant = new Tenant({
        _id: new mongoose.Types.ObjectId(),
        businessName,
        ownerName,
        email,
        phone,
        address,
        gstNumber,
      });

      await tenant.save();

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        _id: new mongoose.Types.ObjectId(),
        tenantId: tenant._id,
        userName,
        email,
        password: hashedPassword,
        role: role || "Admin",
      });

      await newUser.save();
      res.status(201).json({ 
        message: "User and tenant registered successfully",
        tenant: {
          id: tenant._id,
          businessName: tenant.businessName,
        }
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

exports.login = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role, tenantId: user.tenantId },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          userName: user.userName,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

exports.changePassword = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
  body("confirmNewPassword").notEmpty().withMessage("Confirm new password is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.user.id;

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid current password" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];
