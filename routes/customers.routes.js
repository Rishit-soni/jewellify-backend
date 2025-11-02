const express = require("express");
const router = express.Router();
const customersController = require("../controllers/customers.controller");
const { authenticateToken, authorizeRoles } = require("../middlewares/auth");
const { attachTenantId } = require("../middlewares/tenant");

router.get("/", authenticateToken, customersController.getAllCustomers);
router.get("/:id", authenticateToken, customersController.getCustomerById);
router.post(
  "/",
  authenticateToken,
  authorizeRoles("Admin", "Manager"),
  attachTenantId,
  customersController.createCustomer
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("Admin", "Manager"),
  attachTenantId,
  customersController.updateCustomer
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("Admin"),
  customersController.deleteCustomer
);

module.exports = router;
