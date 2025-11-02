const express = require("express");
const router = express.Router();
const itemsController = require("../controllers/items.controller");
const { authenticateToken, authorizeRoles } = require("../middlewares/auth");
const { attachTenantId } = require("../middlewares/tenant");
const upload = require("../middlewares/upload");

router.get("/", authenticateToken, itemsController.getAllItems);
router.get("/:id", authenticateToken, itemsController.getItemById);
router.post(
  "/",
  authenticateToken,
  authorizeRoles("Admin", "Manager"),
  attachTenantId,
  upload.array("images", 5),
  itemsController.createItem
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("Admin", "Manager"),
  attachTenantId,
  upload.array("images", 5),
  itemsController.updateItem
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("Admin"),
  itemsController.deleteItem
);

module.exports = router;
