const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/items", require("./routes/item.routes"));
app.use("/api/customers", require("./routes/customers.routes"));
app.use("/api/orders", require("./routes/orders.routes"));
app.use("/api/quotations", require("./routes/quotations.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/users", require("./routes/users.router"));

module.exports = app;
