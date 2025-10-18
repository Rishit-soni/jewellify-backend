const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Item = require("../models/Item");
const Customer = require("../models/Customer");
const { body, validationResult } = require("express-validator");

exports.generateQuotation = [
  body("customerId")
    .optional()
    .isMongoId()
    .withMessage("Valid customer ID is required"),
  body("items")
    .isArray({ min: 1 })
    .withMessage("At least one item is required"),
  body("items.*.itemCode").notEmpty().withMessage("Item code is required"),
  body("items.*.qty")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  body("items.*.price").isNumeric().withMessage("Price must be a number"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { customerId, items } = req.body;
      let customer = null;

      if (customerId) {
        customer = await Customer.findById(customerId);
        if (!customer) {
          return res.status(404).json({ message: "Customer not found" });
        }
      }

      // Validate items exist
      const quotationItems = [];
      for (const quoteItem of items) {
        const item = await Item.findOne({ itemCode: quoteItem.itemCode });
        if (!item) {
          return res
            .status(400)
            .json({ message: `Item ${quoteItem.itemCode} not found` });
        }
        quotationItems.push({
          ...item.toObject(),
          qty: quoteItem.qty,
          price: quoteItem.price,
          total: quoteItem.qty * quoteItem.price,
        });
      }

      // Generate PDF
      const doc = new PDFDocument();
      const fileName = `quotation_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, "../uploads", fileName);

      // Ensure uploads directory exists
      if (!fs.existsSync(path.join(__dirname, "../uploads"))) {
        fs.mkdirSync(path.join(__dirname, "../uploads"), { recursive: true });
      }

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // PDF Content
      doc.fontSize(20).text("Jewellify - Quotation", { align: "center" });
      doc.moveDown();

      if (customer) {
        doc.fontSize(14).text(`Customer: ${customer.name}`);
        doc.text(`Phone: ${customer.phone}`);
        if (customer.email) doc.text(`Email: ${customer.email}`);
        doc.moveDown();
      }

      doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      // Items table
      const tableTop = doc.y;
      doc.fontSize(10);
      doc.text("Item Code", 50, tableTop);
      doc.text("Name", 150, tableTop);
      doc.text("Qty", 350, tableTop);
      doc.text("Price", 400, tableTop);
      doc.text("Total", 470, tableTop);

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      let y = tableTop + 25;
      let totalAmount = 0;

      quotationItems.forEach((item) => {
        doc.text(item.itemCode, 50, y);
        doc.text(item.name, 150, y, { width: 180, ellipsis: true });
        doc.text(item.qty.toString(), 350, y);
        doc.text(`₹${item.price}`, 400, y);
        doc.text(`₹${item.total}`, 470, y);
        totalAmount += item.total;
        y += 20;
      });

      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 10;
      doc.fontSize(12).text(`Total Amount: ₹${totalAmount}`, 400, y);

      doc.end();

      writeStream.on("finish", () => {
        res.json({
          message: "Quotation generated successfully",
          fileName,
          downloadUrl: `/uploads/${fileName}`,
          totalAmount,
        });
      });

      writeStream.on("error", (error) => {
        console.error("Error writing PDF:", error);
        res.status(500).json({ message: "Error generating quotation" });
      });
    } catch (error) {
      console.error("Error generating quotation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];
