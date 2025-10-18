const express = require("express");
const router = express.Router();
const customersController = require("../controllers/customers.controller");
const { authenticateToken, authorizeRoles } = require("../middlewares/auth");

router.get("/", authenticateToken, customersController.getAllCustomers);
router.get("/:id", authenticateToken, customersController.getCustomerById);
router.post(
  "/",
  authenticateToken,
  authorizeRoles("Admin", "Manager"),
  customersController.createCustomer
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("Admin", "Manager"),
  customersController.updateCustomer
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("Admin"),
  customersController.deleteCustomer
);

module.exports = router;
