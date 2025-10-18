const mongoose = require("mongoose");
const User = require("../models/user"); // Assuming you have a User model defined
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.find({ email });
  if (existingUser.length > 0) {
    return res.status(400).json({ message: "User already exists" });
  } else {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      email,
      password: hashedPassword,
    });
    await newUser
      .save()
      .exec()
      .then((result) => {
        console.log("User created:", result);
        return res
          .status(201)
          .json({ message: "User registered successfully", user: result });
      })
      .catch((error) => {
        console.error("Error creating user:", error);
        return res.status(500).json({ message: "Internal server error" });
      });
  }
};
