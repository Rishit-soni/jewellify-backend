# Quotation to Invoice Workflow - Visual Guide

## 🔄 Complete Business Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     QUOTATION & BILLING WORKFLOW                 │
└─────────────────────────────────────────────────────────────────┘

Step 1: CREATE QUOTATION
┌─────────────────────────────────────────────────────────────────┐
│ User selects items from inventory                                │
│ ├─ Single item OR Multiple items                                │
│ ├─ System fetches current Gold/Silver rates                     │
│ └─ System calculates price breakdown for each item:             │
│    ├─ Base Cost = Net Weight × Metal Rate                       │
│    ├─ Labour Cost (based on mode)                               │
│    ├─ Other Charges                                              │
│    └─ Item Total                                                 │
│                                                                   │
│ Display: Total Amount with all breakdowns                        │
│                                                                   │
│ Optional: Add/Select Customer                                    │
│                                                                   │
│ Actions:                                                          │
│ ├─ Save as Draft                                                 │
│ ├─ Generate PDF                                                  │
│ └─ Convert to Invoice ────────────────────────┐                 │
└───────────────────────────────────────────────┼─────────────────┘
                                                 │
                                                 ▼
Step 2: CREATE INVOICE/BILL
┌─────────────────────────────────────────────────────────────────┐
│ System creates invoice from quotation                            │
│ ├─ Auto-generate Invoice Number (INV-2024-0001)                 │
│ ├─ Copy all items with price breakdown                          │
│ └─ Link to customer (required)                                   │
│                                                                   │
│ Calculate GST:                                                    │
│ ├─ CGST @ 1.5% on subtotal                                       │
│ ├─ SGST @ 1.5% on subtotal                                       │
│ └─ Total Tax = CGST + SGST                                       │
│                                                                   │
│ Apply Discount (Optional):                                       │
│ ├─ Percentage OR Fixed Amount                                    │
│ └─ Requires Admin/Manager approval                               │
│                                                                   │
│ Calculate Net Total:                                              │
│ └─ Subtotal + Tax - Discount = Net Total                         │
│                                                                   │
│ Actions:                                                          │
│ ├─ Save as Draft                                                 │
│ ├─ Add Payments ──────────────────────────────┐                 │
│ └─ Generate Invoice PDF                       │                 │
└───────────────────────────────────────────────┼─────────────────┘
                                                 │
                                                 ▼
Step 3: RECORD PAYMENTS
┌─────────────────────────────────────────────────────────────────┐
│ Add Payment(s) to Invoice                                        │
│                                                                   │
│ Payment Modes:                                                    │
│ ├─ Cash                                                           │
│ ├─ Old Gold (Weight × Rate)                                      │
│ ├─ Old Silver (Weight × Rate)                                    │
│ ├─ UPI (with transaction reference)                              │
│ ├─ RTGS/NEFT (with reference)                                    │
│ ├─ Card                                                           │
│ └─ Cheque (with cheque details)                                  │
│                                                                   │
│ Multiple payments allowed in single invoice                      │
│                                                                   │
│ Calculate Balance:                                                │
│ ├─ Total Paid = Sum of all payments                              │
│ ├─ Balance = Net Total - Total Paid                              │
│ └─ Balance Type:                                                  │
│    ├─ DUE (if balance > 0)                                       │
│    ├─ CREDIT (if balance < 0)                                    │
│    └─ PAID (if balance = 0)                                      │
│                                                                   │
│ Update Invoice Status:                                            │
│ ├─ PARTIALLY_PAID (if balance > 0)                               │
│ ├─ FULLY_PAID (if balance = 0)                                   │
│ └─ PAID_WITH_CREDIT (if balance < 0)                             │
│                                                                   │
│ Actions:                                                          │
│ ├─ Update Inventory ──────────────────────────┐                 │
│ └─ Update Customer Ledger ────────────────────┼─────────────┐   │
└───────────────────────────────────────────────┼─────────────┼───┘
                                                 │             │
                                                 ▼             ▼
Step 4: UPDATE INVENTORY                    Step 5: UPDATE LEDGER
┌──────────────────────────────────────┐   ┌──────────────────────────────┐
│ For each item in invoice:            │   │ Create Ledger Entries:       │
│ ├─ Change status to SOLD             │   │                              │
│ ├─ Link to customer                  │   │ 1. Invoice Entry (DEBIT)     │
│ ├─ Link to invoice                   │   │    Amount: Net Total         │
│ ├─ Set sold date                     │   │                              │
│ └─ Remove from available inventory   │   │ 2. Payment Entries (CREDIT)  │
│                                       │   │    For each payment:         │
│ Update Customer's Purchase History:  │   │    ├─ Mode                   │
│ └─ Add items to purchased list       │   │    ├─ Amount                 │
│                                       │   │    └─ Reference              │
│ Display in UI:                        │   │                              │
│ ├─ Sold Items Dashboard              │   │ 3. Balance Entry             │
│ └─ Customer's Items List              │   │    ├─ DUE (if unpaid)        │
│                                       │   │    └─ CREDIT (if overpaid)   │
└──────────────────────────────────────┘   │                              │
                                            │ Calculate Running Balance    │
                                            │                              │
                                            │ Display in:                  │
                                            │ ├─ Customer Ledger View      │
                                            │ └─ Customer Details Page     │
                                            └──────────────────────────────┘
```

---

## 📊 Payment Scenarios - Visual Examples

### Scenario 1: Partial Payment (Customer Owes Money)

```
┌─────────────────────────────────────────────────────────────────┐
│ Invoice: INV-2024-0001                                           │
│ Customer: Rajesh Kumar                                           │
│ Date: 07/02/2026                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Items:                                                            │
│ ├─ Gold Ring (GR01): ₹72,182.50                                 │
│ └─ Silver Bracelet (SB01): ₹2,475.00                            │
│                                                                   │
│ Subtotal: ₹74,657.50                                             │
│ Tax (3%): ₹2,239.72                                              │
│ NET TOTAL: ₹76,897.22                                            │
├─────────────────────────────────────────────────────────────────┤
│ Payments:                                                         │
│ ├─ Cash: ₹50,000.00 (07/02/2026)                                │
│ └─ UPI: ₹10,000.00 (07/02/2026)                                 │
│                                                                   │
│ Total Paid: ₹60,000.00                                           │
│ BALANCE DUE: ₹16,897.22                                          │
│                                                                   │
│ Status: PARTIALLY PAID                                           │
└─────────────────────────────────────────────────────────────────┘

Customer Ledger:
┌──────────────────────────────────────────────────────────────────┐
│ Date       │ Type    │ Description    │ Debit    │ Credit  │ Balance │
├──────────────────────────────────────────────────────────────────┤
│ 07/02/2026 │ INVOICE │ INV-2024-0001 │ 76,897   │         │ 76,897  │
│ 07/02/2026 │ PAYMENT │ Cash          │          │ 50,000  │ 26,897  │
│ 07/02/2026 │ PAYMENT │ UPI           │          │ 10,000  │ 16,897  │
└──────────────────────────────────────────────────────────────────┘

Customer owes: ₹16,897.22
```

---

### Scenario 2: Overpayment (Store Owes Money to Customer)

```
┌─────────────────────────────────────────────────────────────────┐
│ Invoice: INV-2024-0002                                           │
│ Customer: Priya Shah                                             │
│ Date: 08/02/2026                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Items:                                                            │
│ └─ Gold Earrings (GE01): ₹45,000.00                             │
│                                                                   │
│ Subtotal: ₹45,000.00                                             │
│ Tax (3%): ₹1,350.00                                              │
│ Discount (5%): -₹2,250.00                                        │
│ NET TOTAL: ₹44,100.00                                            │
├─────────────────────────────────────────────────────────────────┤
│ Payments:                                                         │
│ ├─ Cash: ₹20,000.00                                              │
│ └─ Old Gold (5g @ ₹6,500/g): ₹32,500.00                         │
│                                                                   │
│ Total Paid: ₹52,500.00                                           │
│ CREDIT BALANCE: ₹8,400.00                                        │
│                                                                   │
│ Status: PAID WITH CREDIT                                         │
└─────────────────────────────────────────────────────────────────┘

Customer Ledger:
┌──────────────────────────────────────────────────────────────────┐
│ Date       │ Type    │ Description    │ Debit   │ Credit  │ Balance │
├──────────────────────────────────────────────────────────────────┤
│ 08/02/2026 │ INVOICE │ INV-2024-0002 │ 44,100  │         │ 44,100  │
│ 08/02/2026 │ PAYMENT │ Cash          │         │ 20,000  │ 24,100  │
│ 08/02/2026 │ PAYMENT │ Old Gold      │         │ 32,500  │ -8,400  │
└──────────────────────────────────────────────────────────────────┘

Store owes customer: ₹8,400.00 (can be used for future purchases)
```

---

### Scenario 3: Full Payment

```
┌─────────────────────────────────────────────────────────────────┐
│ Invoice: INV-2024-0003                                           │
│ Customer: Amit Patel                                             │
│ Date: 09/02/2026                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Items:                                                            │
│ └─ Silver Chain (SC01): ₹15,000.00                              │
│                                                                   │
│ Subtotal: ₹15,000.00                                             │
│ Tax (3%): ₹450.00                                                │
│ NET TOTAL: ₹15,450.00                                            │
├─────────────────────────────────────────────────────────────────┤
│ Payments:                                                         │
│ └─ UPI: ₹15,450.00                                               │
│                                                                   │
│ Total Paid: ₹15,450.00                                           │
│ BALANCE: ₹0.00                                                   │
│                                                                   │
│ Status: FULLY PAID                                               │
└─────────────────────────────────────────────────────────────────┘

Customer Ledger:
┌──────────────────────────────────────────────────────────────────┐
│ Date       │ Type    │ Description    │ Debit   │ Credit  │ Balance │
├──────────────────────────────────────────────────────────────────┤
│ 09/02/2026 │ INVOICE │ INV-2024-0003 │ 15,450  │         │ 15,450  │
│ 09/02/2026 │ PAYMENT │ UPI           │         │ 15,450  │ 0       │
└──────────────────────────────────────────────────────────────────┘

No balance - Fully paid
```

---

## 🔄 Item Status Flow

```
┌──────────────┐
│   CREATED    │ ← New item added to inventory
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  AVAILABLE   │ ← Item is in stock, can be sold
└──────┬───────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐   ┌──────────────┐
│   RESERVED   │   │   DAMAGED    │
└──────┬───────┘   └──────────────┘
       │
       ▼
┌──────────────┐
│     SOLD     │ ← Item sold to customer
└──────┬───────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐   ┌──────────────┐
│   RETURNED   │   │  [FINAL]     │
└──────────────┘   └──────────────┘
       │
       ▼
┌──────────────┐
│  AVAILABLE   │ ← Back in inventory
└──────────────┘
```

---

## 📱 User Interface Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         MAIN DASHBOARD                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Inventory  │  │ Quotations  │  │  Invoices   │             │
│  │     120     │  │      15     │  │      45     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Customers  │  │   Pending   │  │   Revenue   │             │
│  │     250     │  │  Payments   │  │  ₹12.5 Lac  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│ Quick Actions:                                                    │
│ [+ New Quotation]  [+ New Invoice]  [Record Payment]            │
└─────────────────────────────────────────────────────────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ Quotation   │      │   Invoice   │      │   Payment   │
│  Creation   │      │  Creation   │      │  Recording  │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ Select Items│      │ Add Items   │      │ Select      │
│ + Customer  │      │ + Customer  │      │ Invoice     │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ Calculate   │      │ Calculate   │      │ Add Payment │
│ Breakdown   │      │ GST & Total │      │ Details     │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ Generate    │      │ Add         │      │ Update      │
│ PDF         │      │ Payments    │      │ Ledger      │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ Convert to  │      │ Update      │      │ Update      │
│ Invoice     │──────│ Inventory   │      │ Balance     │
└─────────────┘      └─────────────┘      └─────────────┘
```

---

## 💡 Key Business Rules

### Rule 1: Item Selection
- ✅ Can select multiple items in one quotation/invoice
- ✅ Each item shows complete price breakdown
- ✅ Real-time metal rates applied
- ❌ Cannot select SOLD items
- ❌ Cannot select DAMAGED items

### Rule 2: Customer Association
- ✅ Quotation: Customer is optional
- ❌ Invoice: Customer is required
- ✅ Can create new customer during quotation/invoice creation

### Rule 3: Pricing
- ✅ Metal rate can be overridden manually
- ✅ Labour calculation based on item's labour mode
- ✅ Other charges added as-is
- ✅ GST calculated on subtotal (before discount)
- ✅ Discount applied after tax calculation

### Rule 4: Payments
- ✅ Multiple payment modes in single invoice
- ✅ Partial payments allowed
- ✅ Overpayments create customer credit
- ✅ Old gold/silver calculated: weight × rate
- ✅ Payment reference required for UPI/RTGS

### Rule 5: Inventory
- ✅ Item status changes to SOLD when invoice is paid
- ✅ Item linked to customer and invoice
- ✅ Sold items appear in customer's purchase history
- ❌ Cannot delete sold items
- ✅ Can return items (status → RETURNED)

### Rule 6: Ledger
- ✅ Auto-created from invoices and payments
- ✅ Running balance maintained
- ✅ DUE balance shows in customer details
- ✅ CREDIT balance can be used for future purchases
- ✅ Manual adjustments require Admin approval

---

## 🎯 Success Criteria

### For Quotation
- [x] Shows detailed price breakdown per item
- [x] Displays current metal rates
- [x] Calculates total accurately
- [x] Generates professional PDF
- [x] Can be converted to invoice

### For Invoice
- [x] GST calculated correctly (CGST + SGST)
- [x] Discount applied properly
- [x] Multiple payment modes supported
- [x] Balance calculated accurately
- [x] Professional invoice PDF with all details

### For Inventory
- [x] Item status updated when sold
- [x] Sold items linked to customer
- [x] Purchase history visible
- [x] Sold items dashboard available

### For Ledger
- [x] Auto-updated from invoices
- [x] Running balance accurate
- [x] DUE/CREDIT tracked properly
- [x] Customer can view ledger

---

## 📋 Testing Checklist

- [ ] Create quotation with single item
- [ ] Create quotation with multiple items
- [ ] Convert quotation to invoice
- [ ] Create invoice with GST calculation
- [ ] Apply percentage discount
- [ ] Apply fixed amount discount
- [ ] Record cash payment
- [ ] Record old gold payment
- [ ] Record multiple payments
- [ ] Test partial payment (DUE balance)
- [ ] Test overpayment (CREDIT balance)
- [ ] Test full payment
- [ ] Verify item status changes to SOLD
- [ ] Verify customer purchase history
- [ ] Verify ledger entries created
- [ ] Verify balance calculation
- [ ] Generate quotation PDF
- [ ] Generate invoice PDF
- [ ] Test sold items dashboard
- [ ] Test customer ledger view

---

**For detailed implementation, see:**
- [QUOTATION_BILLING_REQUIREMENTS.md](./QUOTATION_BILLING_REQUIREMENTS.md)
- [BILLING_QUICK_REFERENCE.md](./BILLING_QUICK_REFERENCE.md)
