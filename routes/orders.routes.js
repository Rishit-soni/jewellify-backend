const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orders.controller");
const { authenticateToken, authorizeRoles } = require("../middlewares/auth");
const { attachTenantId } = require("../middlewares/tenant");

router.get("/", authenticateToken, ordersController.getAllOrders);
router.get("/:id", authenticateToken, ordersController.getOrderById);
router.post(
  "/",
  authenticateToken,
  authorizeRoles("Admin", "Manager", "Staff"),
  attachTenantId,
  ordersController.createOrder
);
router.put(
  "/:id/status",
  authenticateToken,
  authorizeRoles("Admin", "Manager"),
  attachTenantId,
  ordersController.updateOrderStatus
);

module.exports = router;
