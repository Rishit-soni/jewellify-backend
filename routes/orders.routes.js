const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orders.controller");
const { authenticateToken, authorizeRoles } = require("../middlewares/auth");

router.get("/", authenticateToken, ordersController.getAllOrders);
router.get("/:id", authenticateToken, ordersController.getOrderById);
router.post(
  "/",
  authenticateToken,
  authorizeRoles("Admin", "Manager", "Staff"),
  ordersController.createOrder
);
router.put(
  "/:id/status",
  authenticateToken,
  authorizeRoles("Admin", "Manager"),
  ordersController.updateOrderStatus
);

module.exports = router;
