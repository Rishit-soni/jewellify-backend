const express = require("express");
const usersController = require("../controllers/users.controller");
const router = express.Router();
const User = require("../models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

router.post("/register", async (req, res) => {
  // Create new user
  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    userName: req.body.userName,
    password: await bcrypt.hash(req.body.password, 10),
  });
  await user
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
});
// router.post("/login", usersController.login);

module.exports = router;
