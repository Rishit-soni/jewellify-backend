const express = require("express");
const usersController = require("../controllers/users.controller");
const { authenticateToken, authorizeRoles } = require("../middlewares/auth");
const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("Admin"),
  usersController.getAllUsers
);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("Admin"),
  usersController.createUser
);

module.exports = router;
