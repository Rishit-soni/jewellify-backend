# Quotation & Billing System - Quick Reference

## 🎯 Core Features Summary

### 1. Enhanced Quotation System
- Select single/multiple items from inventory
- Real-time gold/silver rates
- Detailed price breakdown per item:
  - Base metal cost (weight × rate)
  - Labour cost (3 modes: %, per gram, fixed)
  - Other charges (hallmark, polish, etc.)
  - Item total
- Display total amount with all breakdowns
- Optional customer association
- Convert quotation to invoice

### 2. GST Billing & Invoice
- Complete item details with breakdown
- CGST @ 1.5% + SGST @ 1.5% = 3% total tax
- Discount support (percentage or fixed amount)
- Store details (name, address, GST number)
- Bank details (account, IFSC, branch)
- Professional invoice PDF generation

### 3. Flexible Payment System
**Payment Modes:**
- Cash
- Old Gold (weight × rate calculation)
- Old Silver (weight × rate calculation)
- UPI (with transaction reference)
- RTGS/NEFT (with reference number)
- Card
- Cheque (with cheque details)

**Payment Scenarios:**
- **Partial Payment**: Customer pays less → Balance DUE
- **Full Payment**: Customer pays exact amount → PAID
- **Overpayment**: Customer pays more → Balance CREDIT

### 4. Inventory Management
**Item Status:**
- AVAILABLE: In stock
- SOLD: Sold to customer
- RESERVED: Reserved for customer
- DAMAGED: Damaged item
- RETURNED: Returned by customer

**When Item Sold:**
- Status → SOLD
- Link to customer
- Link to invoice
- Remove from available inventory
- Display in customer's purchase history

### 5. Customer Ledger
**Ledger Entries:**
- INVOICE: New purchase (Debit)
- PAYMENT: Payment received (Credit)
- CREDIT_NOTE: Overpayment/returns
- DEBIT_NOTE: Additional charges
- ADJUSTMENT: Manual adjustments

**Customer Balance:**
- DUE: Customer owes money
- CREDIT: Store owes money to customer
- Running balance calculation

---

## 📊 Calculation Examples

### Example 1: Single Item Quotation

**Item:** Gold Ring (GR01)
- Net Weight: 10.5g
- Gold Rate: ₹6,500/g
- Labour: 5% per gram
- Other Charges: Hallmark ₹520

**Calculation:**
```
Base Cost = 10.5g × ₹6,500 = ₹68,250.00
Labour = (10.5 × 6,500 × 5) / 100 = ₹3,412.50
Other Charges = ₹520.00
─────────────────────────────────────────
Item Total = ₹72,182.50
```

### Example 2: Invoice with GST

**Items Total:** ₹74,657.50

**Calculation:**
```
Subtotal:                    ₹74,657.50
CGST @ 1.5%:                 ₹1,119.86
SGST @ 1.5%:                 ₹1,119.86
─────────────────────────────────────────
Total Tax:                   ₹2,239.72
Gross Total:                 ₹76,897.22

Discount (5%):               -₹897.22
─────────────────────────────────────────
NET TOTAL:                   ₹76,000.00
```

### Example 3: Payment with Old Gold

**Invoice Total:** ₹76,000

**Payments:**
```
1. Cash:                     ₹30,000
2. Old Gold (25g @ ₹6,000):  ₹1,50,000
3. UPI:                      ₹10,000
─────────────────────────────────────────
Total Paid:                  ₹1,90,000
Balance:                     ₹1,14,000 (CREDIT)
```

Customer has ₹1,14,000 credit for future purchases!

---

## 🗄️ Key Database Models

### Invoice
- Invoice number, date
- Customer details
- Items with full breakdown
- Tax calculations (CGST, SGST)
- Discount details
- Multiple payments
- Balance tracking
- Status (DRAFT, PARTIALLY_PAID, FULLY_PAID)

### Quotation
- Quotation number, date
- Customer (optional)
- Items with price breakdown
- Total amount
- Status (DRAFT, SENT, CONVERTED)
- PDF URL
- Conversion to invoice

### MetalRate
- Metal type (GOLD, SILVER)
- Purity (24K, 22K, 18K, SILVER)
- Rate per gram
- Effective date
- Source (MANUAL, API)

### Enhanced Item
- Status (AVAILABLE, SOLD, etc.)
- Metal type & purity
- Sold to customer
- Sold date & invoice
- Reserved details

---

## 🔌 Key API Endpoints

### Quotations
```
POST   /api/quotations              - Create quotation
GET    /api/quotations/:id          - Get quotation
POST   /api/quotations/:id/convert  - Convert to invoice
GET    /api/quotations/:id/pdf      - Download PDF
```

### Invoices
```
POST   /api/invoices                - Create invoice
GET    /api/invoices/:id            - Get invoice details
POST   /api/invoices/:id/payments   - Add payment
GET    /api/invoices/:id/pdf        - Download invoice PDF
```

### Metal Rates
```
GET    /api/metal-rates             - Get current rates
POST   /api/metal-rates             - Update rates (Admin)
```

### Ledger
```
GET    /api/ledger/customer/:id     - Get customer ledger
GET    /api/ledger/summary/:id      - Get balance summary
```

---

## 🎨 UI Screens Required

1. **Quotation Creation**
   - Item selection with search
   - Real-time price calculation
   - Customer selection
   - PDF generation

2. **Invoice/Billing**
   - Item details with breakdown
   - GST calculation display
   - Discount input
   - Multiple payment modes
   - Balance calculation

3. **Payment Recording**
   - Payment mode selection
   - Amount input
   - Reference/transaction details
   - Old gold/silver calculator

4. **Customer Ledger**
   - Transaction history table
   - Balance summary
   - Filter by date range
   - Export to PDF

5. **Inventory Dashboard**
   - Filter by status
   - Sold items view
   - Customer purchase history
   - Status update

6. **Store Settings**
   - Store details form
   - Bank details management
   - Invoice settings
   - Tax rate configuration

---

## ✅ Implementation Checklist

### Phase 1: Database & Backend
- [ ] Create Invoice model
- [ ] Create MetalRate model
- [ ] Create Quotation model (enhanced)
- [ ] Update Item model with status
- [ ] Update Ledger model
- [ ] Update Tenant model with bank details

### Phase 2: API Development
- [ ] Metal rate APIs
- [ ] Enhanced quotation APIs
- [ ] Invoice/billing APIs
- [ ] Payment recording APIs
- [ ] Ledger APIs
- [ ] Store settings APIs

### Phase 3: Business Logic
- [ ] Price calculation functions
- [ ] GST calculation
- [ ] Discount calculation
- [ ] Balance calculation
- [ ] Ledger entry automation

### Phase 4: PDF Generation
- [ ] Enhanced quotation PDF
- [ ] Invoice PDF with GST
- [ ] Customer ledger PDF

### Phase 5: Frontend
- [ ] Quotation creation UI
- [ ] Invoice/billing UI
- [ ] Payment recording UI
- [ ] Customer ledger UI
- [ ] Inventory dashboard
- [ ] Store settings UI

---

## 🚀 Quick Start Guide

### Step 1: Set Up Metal Rates
```javascript
POST /api/metal-rates
{
  "metalType": "GOLD",
  "purity": "22K",
  "rate": 6500
}
```

### Step 2: Create Quotation
```javascript
POST /api/quotations
{
  "customerId": "optional",
  "items": [
    {
      "itemId": "item_id",
      "metalRate": 6500
    }
  ]
}
```

### Step 3: Convert to Invoice
```javascript
POST /api/quotations/:id/convert
{
  "discount": {
    "type": "PERCENTAGE",
    "value": 5
  }
}
```

### Step 4: Record Payment
```javascript
POST /api/invoices/:id/payments
{
  "mode": "CASH",
  "amount": 30000
}
```

---

## 📞 Support

For detailed requirements, see:
- [QUOTATION_BILLING_REQUIREMENTS.md](./QUOTATION_BILLING_REQUIREMENTS.md)

For implementation questions:
- Check database schemas in requirements doc
- Review calculation formulas
- See API endpoint specifications
