# Quotation, Billing, Invoice & Sales Module - Requirements Document

## 📋 Table of Contents
1. [Current System Analysis](#current-system-analysis)
2. [New Requirements Overview](#new-requirements-overview)
3. [Module 1: Enhanced Quotation System](#module-1-enhanced-quotation-system)
4. [Module 2: Billing & Invoice System](#module-2-billing--invoice-system)
5. [Module 3: Sales & Inventory Management](#module-3-sales--inventory-management)
6. [Module 4: Payment & Ledger System](#module-4-payment--ledger-system)
7. [Module 5: Store & Bank Details](#module-5-store--bank-details)
8. [Database Schema Changes](#database-schema-changes)
9. [API Endpoints](#api-endpoints)
10. [Business Logic & Calculations](#business-logic--calculations)
11. [UI/UX Requirements](#uiux-requirements)
12. [Implementation Roadmap](#implementation-roadmap)

---

## 1. Current System Analysis

### ✅ **Existing Features**
- **Multi-tenant System**: Tenant-based data isolation
- **Item Management**: Items with images, weights, labour, other charges
- **Customer Management**: Basic customer info (name, phone, email, address, PAN)
- **Category Management**: Item categorization
- **Basic Quotation**: PDF generation with items and prices
- **Basic Order System**: Orders with items, payments
- **Ledger System**: Credit/Debit entries for customers
- **User Management**: Admin, Manager roles
- **Image Upload**: Cloudinary integration (up to 5 images per item)

### ⚠️ **Current Limitations**
- No real-time gold/silver rate integration
- No detailed price breakdown in quotations
- No GST billing support
- No inventory status tracking (sold/available)
- No partial payment support
- No credit/advance payment tracking
- No store/bank details management
- No invoice generation with complete billing details

---

## 2. New Requirements Overview

### 🎯 **Core Objectives**
1. **Enhanced Quotation System** with real-time metal rates and detailed breakdowns
2. **GST-Compliant Billing** with CGST/SGST calculations
3. **Flexible Payment System** supporting multiple payment modes and partial payments
4. **Inventory Management** with sold/available status tracking
5. **Customer Credit/Debit Tracking** with ledger integration
6. **Professional Invoice Generation** with store and bank details

---

## 3. Module 1: Enhanced Quotation System

### 📝 **Functional Requirements**

#### 3.1 Item Selection
- **Single or Multiple Items**: User can select one or more items from inventory
- **Item Details Display**:
  - Item Code
  - Item Name
  - Category (Gold/Silver)
  - Gross Weight
  - Net Weight
  - Labour Mode & Amount
  - Other Charges
  - Images

#### 3.2 Real-Time Metal Rates
- **Gold Rate**: Current market rate per gram
- **Silver Rate**: Current market rate per gram
- **Rate Source**: 
  - Option 1: Manual entry by admin
  - Option 2: API integration (e.g., GoodReturns, MCX)
- **Rate Display**: Show current rate prominently in quotation

#### 3.3 Price Calculation & Breakdown

**For Each Item:**
```
Base Metal Cost = Net Weight × Current Metal Rate (Gold/Silver)

Labour Cost Calculation:
- If mode = "percentage_per_gram": Labour = (Net Weight × Metal Rate × Labour %) / 100
- If mode = "rupees_per_gram": Labour = Net Weight × Labour Amount
- If mode = "fixed_amount": Labour = Labour Amount

Other Charges = Sum of all other charges

Item Total = Base Metal Cost + Labour Cost + Other Charges
```

**Quotation Display:**
```
Item 1: Gold Ring (GR01)
├── Net Weight: 10.5g
├── Gold Rate: ₹6,500/g
├── Base Cost: ₹68,250
├── Labour (5% per gram): ₹3,412.50
├── Other Charges:
│   └── Hallmark: ₹520
└── Item Total: ₹72,182.50

Item 2: Silver Bracelet (SB01)
├── Net Weight: 25g
├── Silver Rate: ₹85/g
├── Base Cost: ₹2,125
├── Labour (₹10 per gram): ₹250
├── Other Charges:
│   └── Polish: ₹100
└── Item Total: ₹2,475

═══════════════════════════════
TOTAL AMOUNT: ₹74,657.50
═══════════════════════════════
```

#### 3.4 Customer Association
- **Optional Customer Selection**: Can create quotation without customer
- **Add Customer**: Link existing customer or create new customer
- **Customer Details Display**: Name, phone, email in quotation

#### 3.5 Quotation Actions
- **Save as Draft**: Save quotation for later
- **Generate PDF**: Create downloadable quotation PDF
- **Convert to Bill**: Convert quotation to invoice/bill
- **Send to Customer**: Email/WhatsApp quotation (future enhancement)

---

## 4. Module 2: Billing & Invoice System

### 📄 **GST Billing Requirements**

#### 4.1 Invoice Structure

**Header Section:**
```
═══════════════════════════════════════════════════════════
                    [STORE LOGO]
                 JEWELLIFY JEWELLERS
           123, MG Road, Mumbai - 400001
        Phone: +91 98765 43210 | Email: info@jewellify.com
              GSTIN: 27XXXXX1234X1Z5
═══════════════════════════════════════════════════════════

INVOICE NO: INV-2024-0001                    Date: 07/02/2026
Customer: Rajesh Kumar                       Phone: 9876543210
Address: 45, Park Street, Mumbai             PAN: ABCDE1234F
```

#### 4.2 Item Details Table

| Item Code | Description | Weight (g) | Metal Rate | Labour | Other Charges | Amount (₹) |
|-----------|-------------|------------|------------|--------|---------------|------------|
| GR01 | Gold Ring | 10.5 | ₹6,500/g | ₹3,412.50 | ₹520 | ₹72,182.50 |
| SB01 | Silver Bracelet | 25 | ₹85/g | ₹250 | ₹100 | ₹2,475 |

#### 4.3 Billing Calculations

```
Subtotal (Before Tax):                    ₹74,657.50

CGST @ 1.5%:                              ₹1,119.86
SGST @ 1.5%:                              ₹1,119.86
───────────────────────────────────────────────────
Total Tax (3%):                           ₹2,239.72

Gross Total:                              ₹76,897.22

Discount (if any):                        -₹897.22
───────────────────────────────────────────────────
TOTAL AMOUNT:                             ₹76,000.00
═══════════════════════════════════════════════════
```

#### 4.4 Discount Management
- **Discount Types**:
  - Fixed Amount (₹500 off)
  - Percentage (5% off)
- **Applied By**: Only Admin/Manager can apply discount
- **Reason**: Optional discount reason field
- **Maximum Discount**: Configurable limit (e.g., 10% max)

#### 4.5 Payment Section

**Payment Breakdown:**
```
Total Bill Amount:                        ₹76,000.00

Payments Received:
├── Cash:                                 ₹30,000.00
├── Old Gold (25g @ ₹6,000/g):           ₹1,50,000.00
├── UPI:                                  ₹10,000.00
└── RTGS:                                 ₹5,000.00
───────────────────────────────────────────────────
Total Paid:                               ₹1,95,000.00

Balance:                                  ₹1,19,000.00 (CREDIT)
```

**Payment Modes:**
1. **Cash**: Direct cash payment
2. **Old Gold**: Exchange of old gold (weight × rate)
3. **Old Silver**: Exchange of old silver (weight × rate)
4. **UPI**: UPI transaction
5. **RTGS/NEFT**: Bank transfer
6. **Card**: Debit/Credit card
7. **Cheque**: Cheque payment (with cheque number)

#### 4.6 Balance Scenarios

**Scenario 1: Partial Payment (Debit Balance)**
```
Bill Amount: ₹76,000
Paid: ₹50,000
Balance: ₹26,000 (DUE)
Status: PARTIALLY PAID
```

**Scenario 2: Overpayment (Credit Balance)**
```
Bill Amount: ₹76,000
Paid: ₹80,000
Balance: ₹4,000 (CREDIT)
Status: PAID WITH CREDIT
```

**Scenario 3: Full Payment**
```
Bill Amount: ₹76,000
Paid: ₹76,000
Balance: ₹0
Status: FULLY PAID
```

#### 4.7 Bank Details Section

**Footer:**
```
───────────────────────────────────────────────────
BANK DETAILS:
Bank Name: HDFC Bank
Account Name: Jewellify Jewellers
Account Number: 1234567890123
IFSC Code: HDFC0001234
Branch: MG Road, Mumbai
───────────────────────────────────────────────────
Terms & Conditions:
1. Goods once sold will not be taken back
2. All disputes subject to Mumbai jurisdiction
───────────────────────────────────────────────────
         Thank you for your business!
      For queries: support@jewellify.com
═══════════════════════════════════════════════════
```

---

## 5. Module 3: Sales & Inventory Management

### 📦 **Inventory Status Tracking**

#### 5.1 Item Status
```javascript
Item Status Enum:
- AVAILABLE: Item is in stock
- SOLD: Item has been sold
- RESERVED: Item is reserved for a customer
- DAMAGED: Item is damaged
- RETURNED: Item was returned by customer
```

#### 5.2 Sales Transaction
When an invoice is created and payment is processed:

1. **Update Item Status**: Mark items as SOLD
2. **Link to Customer**: Associate items with customer
3. **Update Inventory**: Remove from available inventory
4. **Create Ledger Entry**: Record transaction in ledger

#### 5.3 Customer Purchase History
```
Customer: Rajesh Kumar

Purchased Items:
┌─────────────────────────────────────────────────────────┐
│ Invoice: INV-2024-0001          Date: 07/02/2026        │
│ Items:                                                   │
│  - GR01: Gold Ring (10.5g)              ₹72,182.50      │
│  - SB01: Silver Bracelet (25g)          ₹2,475.00       │
│ Total: ₹76,000.00                                       │
│ Status: FULLY PAID                                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Invoice: INV-2024-0015          Date: 15/02/2026        │
│ Items:                                                   │
│  - GN02: Gold Necklace (45g)            ₹3,25,000.00    │
│ Total: ₹3,25,000.00                                     │
│ Status: PARTIALLY PAID (₹1,00,000 due)                  │
└─────────────────────────────────────────────────────────┘
```

#### 5.4 Inventory Dashboard
```
Total Items: 150
├── Available: 120
├── Sold: 25
├── Reserved: 3
└── Damaged: 2

Sold Items (Last 30 Days):
- Gold Items: 15 (Total Value: ₹12,50,000)
- Silver Items: 10 (Total Value: ₹85,000)
```

---

## 6. Module 4: Payment & Ledger System

### 💰 **Enhanced Ledger Management**

#### 6.1 Ledger Entry Types

**Debit Entries (Customer Owes Money):**
```
Type: DEBIT
Reason: Purchase Invoice INV-2024-0001
Amount: ₹26,000
Description: Partial payment - Balance due
Date: 07/02/2026
```

**Credit Entries (Store Owes Money to Customer):**
```
Type: CREDIT
Reason: Overpayment on Invoice INV-2024-0001
Amount: ₹4,000
Description: Excess payment - Can be used for future purchase
Date: 07/02/2026
```

**Payment Entries:**
```
Type: PAYMENT
Reason: Payment received for INV-2024-0001
Amount: ₹26,000
Mode: UPI
Description: Balance payment cleared
Date: 10/02/2026
```

#### 6.2 Customer Ledger View

```
Customer: Rajesh Kumar
Current Balance: ₹22,000 (DUE)

Ledger History:
┌──────────────────────────────────────────────────────────────┐
│ Date       │ Type    │ Description           │ Debit  │ Credit │ Balance │
├──────────────────────────────────────────────────────────────┤
│ 07/02/2026 │ INVOICE │ INV-2024-0001        │ 76,000 │        │ 76,000  │
│ 07/02/2026 │ PAYMENT │ Cash                 │        │ 50,000 │ 26,000  │
│ 10/02/2026 │ PAYMENT │ UPI                  │        │ 4,000  │ 22,000  │
└──────────────────────────────────────────────────────────────┘
```

#### 6.3 Payment Tracking

**Multiple Payment Modes in Single Transaction:**
```javascript
Invoice: INV-2024-0001
Total: ₹76,000

Payments: [
  {
    mode: "CASH",
    amount: 30000,
    date: "2026-02-07",
    reference: null
  },
  {
    mode: "OLD_GOLD",
    amount: 150000,
    date: "2026-02-07",
    reference: "25g @ ₹6,000/g",
    metalDetails: {
      type: "GOLD",
      weight: 25,
      rate: 6000,
      purity: "22K"
    }
  },
  {
    mode: "UPI",
    amount: 10000,
    date: "2026-02-07",
    reference: "UTR123456789"
  },
  {
    mode: "RTGS",
    amount: 5000,
    date: "2026-02-07",
    reference: "REF987654321"
  }
]

Total Paid: ₹195,000
Balance: ₹119,000 (CREDIT)
```

---

## 7. Module 5: Store & Bank Details

### 🏪 **Store Configuration**

#### 7.1 Store Details (Tenant Model Extension)
```javascript
{
  businessName: "Jewellify Jewellers",
  ownerName: "Ramesh Kumar",
  email: "info@jewellify.com",
  phone: "+91 98765 43210",
  address: {
    line1: "123, MG Road",
    line2: "Near City Mall",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    country: "India"
  },
  gstNumber: "27XXXXX1234X1Z5",
  panNumber: "ABCDE1234F",
  logo: "https://cloudinary.com/.../logo.png",
  
  // New fields
  bankDetails: [
    {
      bankName: "HDFC Bank",
      accountName: "Jewellify Jewellers",
      accountNumber: "1234567890123",
      ifscCode: "HDFC0001234",
      branch: "MG Road, Mumbai",
      accountType: "Current",
      isPrimary: true
    },
    {
      bankName: "SBI",
      accountName: "Jewellify Jewellers",
      accountNumber: "9876543210987",
      ifscCode: "SBIN0001234",
      branch: "Fort, Mumbai",
      accountType: "Savings",
      isPrimary: false
    }
  ],
  
  invoiceSettings: {
    invoicePrefix: "INV",
    invoiceStartNumber: 1,
    termsAndConditions: [
      "Goods once sold will not be taken back",
      "All disputes subject to Mumbai jurisdiction"
    ],
    footerText: "Thank you for your business!"
  },
  
  taxSettings: {
    cgstRate: 1.5,
    sgstRate: 1.5,
    igstRate: 3.0
  }
}
```

#### 7.2 Metal Rate Management
```javascript
{
  tenantId: ObjectId,
  metalType: "GOLD" | "SILVER",
  rate: 6500,
  unit: "PER_GRAM",
  purity: "22K" | "24K" | "18K" | "SILVER",
  effectiveDate: Date,
  updatedBy: ObjectId (User),
  source: "MANUAL" | "API",
  isActive: true
}
```

---

## 8. Database Schema Changes

### 🗄️ **New Models**

#### 8.1 Invoice Model
```javascript
const invoiceSchema = new mongoose.Schema({
  _id: ObjectId,
  tenantId: { type: ObjectId, ref: 'Tenant', required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  invoiceDate: { type: Date, default: Date.now },
  
  customerId: { type: ObjectId, ref: 'Customer', required: true },
  
  items: [{
    itemId: { type: ObjectId, ref: 'Item', required: true },
    itemCode: String,
    name: String,
    category: String,
    grossWeight: Number,
    netWeight: Number,
    metalType: { type: String, enum: ['GOLD', 'SILVER'] },
    metalRate: Number,
    baseCost: Number,
    labourCost: Number,
    otherCharges: [{
      name: String,
      amount: Number
    }],
    itemTotal: Number
  }],
  
  subtotal: Number,
  
  tax: {
    cgst: { rate: Number, amount: Number },
    sgst: { rate: Number, amount: Number },
    igst: { rate: Number, amount: Number },
    totalTax: Number
  },
  
  discount: {
    type: { type: String, enum: ['PERCENTAGE', 'FIXED'] },
    value: Number,
    amount: Number,
    reason: String,
    appliedBy: { type: ObjectId, ref: 'User' }
  },
  
  grossTotal: Number,
  netTotal: Number,
  
  payments: [{
    mode: { 
      type: String, 
      enum: ['CASH', 'OLD_GOLD', 'OLD_SILVER', 'UPI', 'RTGS', 'NEFT', 'CARD', 'CHEQUE'] 
    },
    amount: Number,
    date: { type: Date, default: Date.now },
    reference: String,
    metalDetails: {
      type: { type: String, enum: ['GOLD', 'SILVER'] },
      weight: Number,
      rate: Number,
      purity: String
    },
    chequeDetails: {
      chequeNumber: String,
      bankName: String,
      chequeDate: Date
    }
  }],
  
  totalPaid: Number,
  balance: Number,
  balanceType: { type: String, enum: ['DUE', 'CREDIT', 'PAID'] },
  
  status: { 
    type: String, 
    enum: ['DRAFT', 'PARTIALLY_PAID', 'FULLY_PAID', 'CANCELLED'],
    default: 'DRAFT'
  },
  
  quotationId: { type: ObjectId, ref: 'Quotation' },
  
  notes: String,
  createdBy: { type: ObjectId, ref: 'User' },
  
}, { timestamps: true });

invoiceSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ tenantId: 1, customerId: 1 });
invoiceSchema.index({ tenantId: 1, status: 1 });
```

#### 8.2 Enhanced Quotation Model
```javascript
const quotationSchema = new mongoose.Schema({
  _id: ObjectId,
  tenantId: { type: ObjectId, ref: 'Tenant', required: true },
  quotationNumber: { type: String, required: true },
  quotationDate: { type: Date, default: Date.now },
  
  customerId: { type: ObjectId, ref: 'Customer' },
  
  items: [{
    itemId: { type: ObjectId, ref: 'Item', required: true },
    itemCode: String,
    name: String,
    category: String,
    netWeight: Number,
    metalType: { type: String, enum: ['GOLD', 'SILVER'] },
    metalRate: Number,
    baseCost: Number,
    labourCost: Number,
    otherCharges: [{
      name: String,
      amount: Number
    }],
    itemTotal: Number
  }],
  
  totalAmount: Number,
  
  status: { 
    type: String, 
    enum: ['DRAFT', 'SENT', 'CONVERTED', 'EXPIRED'],
    default: 'DRAFT'
  },
  
  validUntil: Date,
  pdfUrl: String,
  
  convertedToInvoice: { type: ObjectId, ref: 'Invoice' },
  
  notes: String,
  createdBy: { type: ObjectId, ref: 'User' },
  
}, { timestamps: true });
```

#### 8.3 Metal Rate Model
```javascript
const metalRateSchema = new mongoose.Schema({
  _id: ObjectId,
  tenantId: { type: ObjectId, ref: 'Tenant', required: true },
  
  metalType: { 
    type: String, 
    enum: ['GOLD', 'SILVER'],
    required: true 
  },
  
  purity: {
    type: String,
    enum: ['24K', '22K', '18K', '14K', 'SILVER'],
    required: true
  },
  
  rate: { type: Number, required: true },
  unit: { type: String, default: 'PER_GRAM' },
  
  effectiveDate: { type: Date, default: Date.now },
  
  source: {
    type: String,
    enum: ['MANUAL', 'API'],
    default: 'MANUAL'
  },
  
  updatedBy: { type: ObjectId, ref: 'User' },
  
  isActive: { type: Boolean, default: true },
  
}, { timestamps: true });

metalRateSchema.index({ tenantId: 1, metalType: 1, purity: 1, isActive: 1 });
```

#### 8.4 Enhanced Item Model
```javascript
// Add to existing Item model:
{
  // ... existing fields ...
  
  status: {
    type: String,
    enum: ['AVAILABLE', 'SOLD', 'RESERVED', 'DAMAGED', 'RETURNED'],
    default: 'AVAILABLE'
  },
  
  metalType: {
    type: String,
    enum: ['GOLD', 'SILVER'],
    required: true
  },
  
  purity: {
    type: String,
    enum: ['24K', '22K', '18K', '14K', 'SILVER']
  },
  
  soldTo: { type: ObjectId, ref: 'Customer' },
  soldDate: Date,
  soldInvoice: { type: ObjectId, ref: 'Invoice' },
  
  reservedFor: { type: ObjectId, ref: 'Customer' },
  reservedUntil: Date,
}
```

#### 8.5 Enhanced Ledger Model
```javascript
// Enhanced LedgerEntry model:
{
  // ... existing fields ...
  
  entryType: {
    type: String,
    enum: ['INVOICE', 'PAYMENT', 'CREDIT_NOTE', 'DEBIT_NOTE', 'ADJUSTMENT'],
    required: true
  },
  
  invoiceId: { type: ObjectId, ref: 'Invoice' },
  
  paymentMode: {
    type: String,
    enum: ['CASH', 'OLD_GOLD', 'OLD_SILVER', 'UPI', 'RTGS', 'NEFT', 'CARD', 'CHEQUE']
  },
  
  reference: String,
  
  balance: Number, // Running balance
}
```

---

## 9. API Endpoints

### 🔌 **New API Routes**

#### 9.1 Metal Rates
```
GET    /api/metal-rates                    - Get current metal rates
POST   /api/metal-rates                    - Add/Update metal rate (Admin only)
GET    /api/metal-rates/history            - Get rate history
```

#### 9.2 Enhanced Quotations
```
GET    /api/quotations                     - Get all quotations
POST   /api/quotations                     - Create quotation with breakdown
GET    /api/quotations/:id                 - Get quotation details
PUT    /api/quotations/:id                 - Update quotation
DELETE /api/quotations/:id                 - Delete quotation
POST   /api/quotations/:id/convert         - Convert to invoice
GET    /api/quotations/:id/pdf             - Download quotation PDF
```

#### 9.3 Invoices/Bills
```
GET    /api/invoices                       - Get all invoices
POST   /api/invoices                       - Create invoice
GET    /api/invoices/:id                   - Get invoice details
PUT    /api/invoices/:id                   - Update invoice
DELETE /api/invoices/:id                   - Cancel invoice
POST   /api/invoices/:id/payments          - Add payment to invoice
GET    /api/invoices/:id/pdf               - Download invoice PDF
GET    /api/invoices/customer/:customerId  - Get customer invoices
```

#### 9.4 Payments
```
POST   /api/payments                       - Record payment
GET    /api/payments/invoice/:invoiceId    - Get invoice payments
GET    /api/payments/customer/:customerId  - Get customer payments
```

#### 9.5 Enhanced Ledger
```
GET    /api/ledger/customer/:customerId    - Get customer ledger
GET    /api/ledger/summary/:customerId     - Get customer balance summary
POST   /api/ledger/adjustment              - Manual ledger adjustment (Admin)
```

#### 9.6 Store Settings
```
GET    /api/store/settings                 - Get store settings
PUT    /api/store/settings                 - Update store settings (Admin)
POST   /api/store/bank-details             - Add bank details (Admin)
PUT    /api/store/bank-details/:id         - Update bank details (Admin)
DELETE /api/store/bank-details/:id         - Delete bank details (Admin)
```

#### 9.7 Enhanced Items
```
GET    /api/items?status=AVAILABLE         - Get items by status
PUT    /api/items/:id/status               - Update item status
GET    /api/items/sold                     - Get sold items
GET    /api/items/customer/:customerId     - Get customer purchased items
```

---

## 10. Business Logic & Calculations

### 🧮 **Calculation Formulas**

#### 10.1 Item Price Calculation
```javascript
function calculateItemPrice(item, metalRate) {
  // Base cost
  const baseCost = item.netWeight * metalRate;
  
  // Labour cost
  let labourCost = 0;
  if (item.labour.mode === 'percentage_per_gram') {
    labourCost = (item.netWeight * metalRate * item.labour.amount) / 100;
  } else if (item.labour.mode === 'rupees_per_gram') {
    labourCost = item.netWeight * item.labour.amount;
  } else if (item.labour.mode === 'fixed_amount') {
    labourCost = item.labour.amount;
  }
  
  // Other charges
  const otherChargesTotal = item.otherCharges.reduce((sum, charge) => sum + charge.amount, 0);
  
  // Item total
  const itemTotal = baseCost + labourCost + otherChargesTotal;
  
  return {
    baseCost,
    labourCost,
    otherChargesTotal,
    itemTotal
  };
}
```

#### 10.2 GST Calculation
```javascript
function calculateGST(subtotal, cgstRate = 1.5, sgstRate = 1.5) {
  const cgstAmount = (subtotal * cgstRate) / 100;
  const sgstAmount = (subtotal * sgstRate) / 100;
  const totalTax = cgstAmount + sgstAmount;
  
  return {
    cgst: { rate: cgstRate, amount: cgstAmount },
    sgst: { rate: sgstRate, amount: sgstAmount },
    totalTax
  };
}
```

#### 10.3 Discount Calculation
```javascript
function calculateDiscount(subtotal, discount) {
  let discountAmount = 0;
  
  if (discount.type === 'PERCENTAGE') {
    discountAmount = (subtotal * discount.value) / 100;
  } else if (discount.type === 'FIXED') {
    discountAmount = discount.value;
  }
  
  return discountAmount;
}
```

#### 10.4 Invoice Total Calculation
```javascript
function calculateInvoiceTotal(items, metalRates, discount, taxRates) {
  // Calculate item totals
  let subtotal = 0;
  const itemsWithPrices = items.map(item => {
    const metalRate = metalRates[item.metalType][item.purity];
    const prices = calculateItemPrice(item, metalRate);
    subtotal += prices.itemTotal;
    return { ...item, ...prices, metalRate };
  });
  
  // Calculate discount
  const discountAmount = discount ? calculateDiscount(subtotal, discount) : 0;
  const afterDiscount = subtotal - discountAmount;
  
  // Calculate GST
  const tax = calculateGST(afterDiscount, taxRates.cgst, taxRates.sgst);
  
  // Calculate net total
  const netTotal = afterDiscount + tax.totalTax;
  
  return {
    items: itemsWithPrices,
    subtotal,
    discountAmount,
    afterDiscount,
    tax,
    grossTotal: subtotal + tax.totalTax,
    netTotal
  };
}
```

#### 10.5 Balance Calculation
```javascript
function calculateBalance(netTotal, payments) {
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const balance = netTotal - totalPaid;
  
  let balanceType;
  if (balance > 0) {
    balanceType = 'DUE';
  } else if (balance < 0) {
    balanceType = 'CREDIT';
  } else {
    balanceType = 'PAID';
  }
  
  return {
    totalPaid,
    balance: Math.abs(balance),
    balanceType
  };
}
```

---

## 11. UI/UX Requirements

### 🎨 **User Interface Specifications**

#### 11.1 Quotation Creation Screen

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Create Quotation                                [Save] [Generate PDF] │
├─────────────────────────────────────────────────────────┤
│ Customer: [Select Customer ▼] [+ New Customer]         │
│                                                          │
│ Current Metal Rates:                                     │
│ Gold (22K): ₹6,500/g  │  Silver: ₹85/g  [Update Rates] │
├─────────────────────────────────────────────────────────┤
│ Items:                                    [+ Add Item]   │
│                                                          │
│ ┌───────────────────────────────────────────────────┐  │
│ │ Item 1: Gold Ring (GR01)                    [×]   │  │
│ │ ├─ Net Weight: 10.5g                              │  │
│ │ ├─ Gold Rate: ₹6,500/g                            │  │
│ │ ├─ Base Cost: ₹68,250.00                          │  │
│ │ ├─ Labour (5% per gram): ₹3,412.50                │  │
│ │ ├─ Other Charges:                                 │  │
│ │ │  └─ Hallmark: ₹520.00                           │  │
│ │ └─ Item Total: ₹72,182.50                         │  │
│ └───────────────────────────────────────────────────┘  │
│                                                          │
│ ┌───────────────────────────────────────────────────┐  │
│ │ Item 2: Silver Bracelet (SB01)              [×]   │  │
│ │ ├─ Net Weight: 25g                                │  │
│ │ ├─ Silver Rate: ₹85/g                             │  │
│ │ ├─ Base Cost: ₹2,125.00                           │  │
│ │ ├─ Labour (₹10 per gram): ₹250.00                 │  │
│ │ ├─ Other Charges:                                 │  │
│ │ │  └─ Polish: ₹100.00                             │  │
│ │ └─ Item Total: ₹2,475.00                          │  │
│ └───────────────────────────────────────────────────┘  │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                    TOTAL AMOUNT: ₹74,657.50             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### 11.2 Invoice/Billing Screen

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Create Invoice                     [Save Draft] [Generate Invoice] │
├─────────────────────────────────────────────────────────┤
│ Invoice No: INV-2024-0001          Date: 07/02/2026     │
│ Customer: Rajesh Kumar             Phone: 9876543210    │
│                                                          │
│ Items: (Same as quotation layout)                       │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ Subtotal:                                  ₹74,657.50   │
│ CGST @ 1.5%:                               ₹1,119.86    │
│ SGST @ 1.5%:                               ₹1,119.86    │
│ Total Tax:                                 ₹2,239.72    │
│ ─────────────────────────────────────────────────────   │
│ Gross Total:                               ₹76,897.22   │
│                                                          │
│ Discount: [Percentage ▼] [5] %  = -₹897.22             │
│ Reason: [Festival Offer________________]                │
│ ─────────────────────────────────────────────────────   │
│ NET TOTAL:                                 ₹76,000.00   │
├─────────────────────────────────────────────────────────┤
│ Payments:                                  [+ Add Payment] │
│                                                          │
│ ┌─ Payment 1 ────────────────────────────────────────┐ │
│ │ Mode: [Cash ▼]                                      │ │
│ │ Amount: ₹30,000.00                                  │ │
│ │ Date: 07/02/2026                                    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─ Payment 2 ────────────────────────────────────────┐ │
│ │ Mode: [Old Gold ▼]                                  │ │
│ │ Weight: 25g  Rate: ₹6,000/g  Purity: [22K ▼]       │ │
│ │ Amount: ₹1,50,000.00                                │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ Total Paid: ₹1,80,000.00                                │
│ Balance: ₹1,04,000.00 (CREDIT)                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### 11.3 Customer Ledger View

```
┌─────────────────────────────────────────────────────────┐
│ Customer: Rajesh Kumar                                   │
│ Phone: 9876543210                                        │
│ Current Balance: ₹22,000.00 (DUE)                       │
├─────────────────────────────────────────────────────────┤
│ Ledger History:                          [Export PDF]   │
│                                                          │
│ Date       │ Type    │ Description      │ Debit  │ Credit │ Balance │
│────────────┼─────────┼──────────────────┼────────┼────────┼─────────│
│ 07/02/2026 │ INVOICE │ INV-2024-0001   │ 76,000 │        │ 76,000  │
│ 07/02/2026 │ PAYMENT │ Cash            │        │ 50,000 │ 26,000  │
│ 10/02/2026 │ PAYMENT │ UPI             │        │ 4,000  │ 22,000  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### 11.4 Inventory Dashboard

```
┌─────────────────────────────────────────────────────────┐
│ Inventory Overview                                       │
├─────────────────────────────────────────────────────────┤
│ Total Items: 150                                         │
│ ├─ Available: 120                                        │
│ ├─ Sold: 25                                              │
│ ├─ Reserved: 3                                           │
│ └─ Damaged: 2                                            │
│                                                          │
│ Filters: [All ▼] [Gold ▼] [Available ▼]  [Search...]   │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ GR01 │ Gold Ring │ 10.5g │ SOLD │ Rajesh Kumar     │ │
│ │ GR02 │ Gold Ring │ 12g   │ AVAILABLE │ -           │ │
│ │ SB01 │ Silver Bracelet │ 25g │ SOLD │ Priya Shah  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 12. Implementation Roadmap

### 📅 **Phase-wise Implementation**

#### **Phase 1: Foundation (Week 1-2)**
- [ ] Create database schemas (Invoice, MetalRate, enhanced models)
- [ ] Set up API routes structure
- [ ] Implement metal rate management
- [ ] Add store settings & bank details management

#### **Phase 2: Enhanced Quotation (Week 3-4)**
- [ ] Build quotation creation with price breakdown
- [ ] Implement real-time metal rate integration
- [ ] Create quotation PDF with detailed breakdown
- [ ] Add quotation to invoice conversion

#### **Phase 3: Billing & Invoice (Week 5-6)**
- [ ] Implement GST billing calculations
- [ ] Create invoice generation with all details
- [ ] Add discount management
- [ ] Build invoice PDF with store & bank details

#### **Phase 4: Payment System (Week 7-8)**
- [ ] Implement multiple payment modes
- [ ] Add partial payment support
- [ ] Build credit/debit balance tracking
- [ ] Create payment recording system

#### **Phase 5: Inventory & Sales (Week 9-10)**
- [ ] Add item status tracking
- [ ] Implement sold items management
- [ ] Link items to customers
- [ ] Build purchase history view

#### **Phase 6: Ledger Integration (Week 11-12)**
- [ ] Enhance ledger with new entry types
- [ ] Auto-create ledger entries from invoices
- [ ] Build customer ledger view
- [ ] Add balance summary dashboard

#### **Phase 7: UI/UX (Week 13-14)**
- [ ] Build quotation creation UI
- [ ] Create invoice/billing UI
- [ ] Design payment recording interface
- [ ] Build customer ledger view
- [ ] Create inventory dashboard

#### **Phase 8: Testing & Refinement (Week 15-16)**
- [ ] Unit testing for calculations
- [ ] Integration testing for workflows
- [ ] User acceptance testing
- [ ] Bug fixes and optimizations

---

## 📊 Summary

This comprehensive system will provide:

1. **Professional Quotations** with detailed price breakdowns and real-time metal rates
2. **GST-Compliant Invoices** with complete billing details
3. **Flexible Payment System** supporting multiple modes and partial payments
4. **Inventory Management** with sold/available status tracking
5. **Customer Credit/Debit Tracking** with integrated ledger
6. **Professional Documentation** with store and bank details

**Total Estimated Time:** 16 weeks (4 months)

**Key Technologies:**
- Backend: Node.js, Express, MongoDB
- PDF Generation: PDFKit
- Frontend: Angular (existing)
- File Storage: Cloudinary

**Next Steps:**
1. Review and approve this requirements document
2. Prioritize features if needed
3. Begin Phase 1 implementation
4. Set up development milestones
