const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categories.controller");
const { authenticateToken, authorizeRoles } = require("../middlewares/auth");

router.get("/", authenticateToken, categoriesController.getAllCategories);
router.post(
  "/",
  authenticateToken,
  authorizeRoles("Admin"),
  categoriesController.createCategory
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("Admin"),
  categoriesController.updateCategory
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("Admin"),
  categoriesController.deleteCategory
);

module.exports = router;
