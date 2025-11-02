# Multi-Tenancy Implementation Guide

## Overview
This application has been converted into a **Multi-Tenant SaaS** architecture, allowing multiple jewelry stores to use the same system while keeping their data completely isolated.

## Key Changes

### 1. Tenant Model
- **Location**: `models/Tenant.js`
- Stores business information for each jewelry store
- Fields: `businessName`, `ownerName`, `email`, `phone`, `address`, `gstNumber`, `isActive`

### 2. User Model Updates
- **Location**: `models/user.js`
- Added `tenantId` field (required) linking each user to their tenant
- Every user now belongs to exactly one tenant (jewelry store)

### 3. Business Models with Tenant Isolation
All business models now include `tenantId`:
- **Item** (`models/Item.js`) - Unique itemCode per tenant
- **Customer** (`models/Customer.js`)
- **Order** (`models/Order.js`)
- **LedgerEntry** (`models/LedgerEntry.js`)

Each model has compound indexes to ensure data isolation and performance.

### 4. Authentication Flow
**Registration** (`controllers/auth.controller.js`):
- Creates a new Tenant record
- Creates an Admin user linked to that tenant
- Required fields: `userName`, `email`, `password`, `businessName`, `ownerName`, `phone`

**Login** (`controllers/auth.controller.js`):
- Returns JWT token containing `tenantId`
- Token payload: `{ id, email, role, tenantId }`

### 5. Middleware
**Auth Middleware** (`middlewares/auth.js`):
- Extracts `tenantId` from JWT and attaches to `req.tenantId`

**Tenant Middleware** (`middlewares/tenant.js`):
- Validates `tenantId` exists
- Automatically injects `tenantId` into `req.body` for POST/PUT operations

### 6. Controller Updates
All controllers now filter by `tenantId`:
- **GET** operations: Filter by `req.tenantId`
- **POST** operations: Tenant middleware injects `tenantId`
- **PUT/DELETE** operations: Find by both `_id` and `tenantId`

Updated controllers:
- `items.controller.js`
- `customers.controller.js`
- `orders.controller.js`
- `dashboard.controller.js`
- `quotations.controller.js`

### 7. Route Protection
Routes updated to include tenant middleware:
- `routes/item.routes.js`
- `routes/customers.routes.js`
- `routes/orders.routes.js`

## Testing the Multi-Tenant System

### Step 1: Register First Tenant
```json
POST /api/auth/register
{
  "userName": "Admin User",
  "email": "admin@store1.com",
  "password": "password123",
  "businessName": "Golden Jewels Store",
  "ownerName": "John Doe",
  "phone": "9876543210",
  "address": "123 Main Street",
  "gstNumber": "GST1234567890"
}
```

### Step 2: Register Second Tenant
```json
POST /api/auth/register
{
  "userName": "Admin User",
  "email": "admin@store2.com",
  "password": "password123",
  "businessName": "Silver Palace",
  "ownerName": "Jane Smith",
  "phone": "9876543211",
  "address": "456 Market Road",
  "gstNumber": "GST0987654321"
}
```

### Step 3: Login and Test Isolation
1. Login with `admin@store1.com`
2. Create items, customers, orders
3. Logout and login with `admin@store2.com`
4. Verify you can only see Store 2's data

## Data Isolation Guarantees

### Database Level
- Compound indexes ensure `itemCode` is unique per tenant
- All queries include `tenantId` filter

### Application Level
- JWT contains `tenantId`
- Middleware validates tenant access
- Controllers enforce tenant filtering

### Example Queries
```javascript
// OLD (Single-Tenant)
Item.find({ category: "ring" })

// NEW (Multi-Tenant)
Item.find({ tenantId: req.tenantId, category: "ring" })
```

## Security Considerations

1. **JWT Protection**: Token contains `tenantId`, validated on every request
2. **Middleware Enforcement**: All protected routes require authentication
3. **Query Filtering**: All database queries include `tenantId`
4. **No Cross-Tenant Access**: Users can only access their tenant's data

## Migration Notes

⚠️ **Important**: Existing data will need migration to assign `tenantId` values.

For existing databases:
1. Create a default tenant
2. Update all existing records with the default `tenantId`
3. Update all existing users with the default `tenantId`

## API Changes

### Registration Endpoint
**New Required Fields**:
- `businessName` (string, required)
- `ownerName` (string, required)
- `phone` (string, required)
- `address` (string, optional)
- `gstNumber` (string, optional)

### Login Response
**New Fields in Response**:
```json
{
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "userName": "Admin User",
    "email": "admin@store.com",
    "role": "Admin",
    "tenantId": "tenant-id"  // NEW
  }
}
```

## Deployment Checklist

- [x] Tenant model created
- [x] User model updated with tenantId
- [x] All business models updated with tenantId
- [x] Auth controller updated for tenant creation
- [x] Middleware created and integrated
- [x] All controllers updated with tenant filtering
- [x] All routes protected with tenant middleware
- [x] Indexes created for performance
- [x] Postman collection updated with multi-tenant support
- [x] Added tenant_id variable to Postman collection
- [x] Updated registration requests with required tenant fields
- [x] Updated login tests to capture tenantId from response

## Next Steps

1. **Database Migration**: Migrate existing data
2. **Testing**: Thoroughly test multi-tenant isolation
3. **Deployment**: Deploy to production (Render)
4. **Monitoring**: Monitor tenant separation in production
5. **Backup Strategy**: Implement tenant-aware backups
