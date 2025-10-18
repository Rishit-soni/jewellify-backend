const Item = require("../models/Item");
const Order = require("../models/Order");
const Customer = require("../models/Customer");

exports.getDashboardSummary = async (req, res) => {
  try {
    // Total stock value (assuming gold and silver prices, but simplified)
    const items = await Item.find();
    const totalStockValue = items.reduce(
      (sum, item) => sum + item.stockQty * 1000,
      0
    ); // Simplified calculation

    // Today's sales summary
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow },
      status: "Completed",
    });

    const todaysSales = todaysOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    // Pending payments (simplified - orders not completed)
    const pendingOrders = await Order.find({ status: { $ne: "Completed" } });
    const pendingPayments = pendingOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    // Weekly/monthly revenue chart data (last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const dayOrders = await Order.find({
        createdAt: { $gte: startOfDay, $lt: endOfDay },
        status: "Completed",
      });

      const dayRevenue = dayOrders.reduce(
        (sum, order) => sum + order.totalAmount,
        0
      );
      weeklyData.push({
        date: startOfDay.toISOString().split("T")[0],
        revenue: dayRevenue,
      });
    }

    // Top-selling items (simplified - based on order frequency)
    const itemSales = {};
    const allOrders = await Order.find({ status: "Completed" });
    allOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (itemSales[item.itemCode]) {
          itemSales[item.itemCode] += item.qty;
        } else {
          itemSales[item.itemCode] = item.qty;
        }
      });
    });

    const topSellingItems = Object.entries(itemSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([itemCode, qty]) => ({ itemCode, qty }));

    res.json({
      totalStockValue,
      todaysSales,
      pendingPayments,
      weeklyRevenue: weeklyData,
      topSellingItems,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
