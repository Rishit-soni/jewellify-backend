# 💎 Jewellify - Jewelry Inventory & Billing System

A comprehensive PWA-based jewelry inventory, billing & CRM system for jewelers. Built with Node.js, Express.js, MongoDB, and designed to work seamlessly with Angular frontend.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Modules

- **Authentication & Roles**: JWT-based authentication with role-based access (Admin, Manager, Staff)
- **Jewelry Item Management**: Complete CRUD operations with image uploads, search/filter/sort
- **Customer Management**: Customer profiles with purchase history and payment tracking
- **Order Management**: Order creation, status updates, payment processing
- **Quotation System**: PDF quotation generation with customer details
- **Dashboard Analytics**: Sales summaries, stock values, revenue charts
- **Ledger System**: Manual credit/debit entries with customer reconciliation

### Technical Features

- RESTful API design
- File upload support (multiple images)
- PDF generation for invoices/quotations
- Input validation with express-validator
- CORS support for Angular frontend
- Error handling and logging
- Role-based access control

## 🛠 Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **PDF Generation**: PDFKit
- **Email**: Nodemailer
- **Validation**: express-validator
- **Security**: bcryptjs for password hashing

### Development Tools

- **Process Management**: Nodemon
- **Environment**: dotenv
- **Logging**: Morgan
- **CORS**: cors

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/jewellify-backend.git
   cd jewellify-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## 🔧 Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/jewellify

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@jewellify.com

# File Upload
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg
```

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

All protected routes require JWT token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Request Body:**

```json
{
  "userName": "admin",
  "email": "admin@jewellify.com",
  "password": "password123",
  "role": "Admin"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "...",
    "userName": "admin",
    "email": "admin@jewellify.com",
    "role": "Admin"
  }
}
```

### POST /api/auth/login

Authenticate user and get JWT token.

**Request Body:**

```json
{
  "email": "admin@jewellify.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "userName": "admin",
    "email": "admin@jewellify.com",
    "role": "Admin"
  }
}
```

---

## 💎 Items Management

### GET /api/items

Get all jewelry items with optional filtering.

**Query Parameters:**

- `search`: Search by name or description
- `category`: Filter by category
- `sortBy`: Sort field (createdAt, name, etc.)
- `sortOrder`: Sort order (asc, desc)
- `page`: Page number
- `limit`: Items per page

**Response:**

```json
{
  "items": [
    {
      "_id": "...",
      "itemCode": "R001",
      "name": "Gold Ring",
      "description": "Beautiful 18k gold ring",
      "category": "Ring",
      "grossWeight": 10.5,
      "netWeight": 9.2,
      "source": "Local Supplier",
      "huid": "HUID123456",
      "images": ["uploads/image1.jpg"],
      "stockQty": 5,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### GET /api/items/:id

Get specific item by ID.

### POST /api/items

Create new jewelry item (Admin/Manager only).

**Request:** Form-data with files

- `itemCode`: String (required, unique)
- `name`: String (required)
- `description`: String
- `category`: String (required)
- `grossWeight`: Number (required)
- `netWeight`: Number (required)
- `source`: String (required)
- `huid`: String (required)
- `stockQty`: Number (default: 1)
- `images`: File[] (max 5 images)

### PUT /api/items/:id

Update item (Admin/Manager only).

### DELETE /api/items/:id

Delete item (Admin only).

---

## 👥 Customer Management

### GET /api/customers

Get all customers.

### GET /api/customers/:id

Get customer by ID with purchase history.

### POST /api/customers

Create new customer.

**Request Body:**

```json
{
  "name": "John Doe",
  "phone": "+91-9876543210",
  "email": "john@example.com",
  "address": "123 Main St, City",
  "panNumber": "ABCDE1234F",
  "note": "Regular customer"
}
```

### PUT /api/customers/:id

Update customer information.

### DELETE /api/customers/:id

Delete customer.

---

## 📦 Order Management

### GET /api/orders

Get all orders.

### GET /api/orders/:id

Get order by ID with full details.

### POST /api/orders

Create new order.

**Request Body:**

```json
{
  "customerId": "customer_id_here",
  "items": [
    {
      "itemCode": "R001",
      "qty": 1,
      "price": 50000
    }
  ],
  "totalWeight": 9.2,
  "totalAmount": 50000,
  "payments": [
    {
      "mode": "Cash",
      "amount": 50000
    }
  ]
}
```

### PUT /api/orders/:id/status

Update order status.

**Request Body:**

```json
{
  "status": "Completed"
}
```

**Available Statuses:** Placed, Processing, Completed, Cancelled

---

## 📄 Quotations

### POST /api/quotations

Generate PDF quotation.

**Request Body:**

```json
{
  "customerId": "customer_id_here",
  "items": [
    {
      "itemCode": "R001",
      "qty": 2,
      "price": 45000
    }
  ]
}
```

**Response:** PDF file download

---

## 📊 Dashboard

### GET /api/dashboard/summary

Get dashboard analytics.

**Response:**

```json
{
  "totalStockValue": {
    "gold": 2500000,
    "silver": 150000
  },
  "todaySales": {
    "amount": 125000,
    "orders": 5
  },
  "pendingPayments": 75000,
  "weeklyRevenue": [
    { "date": "2024-01-01", "amount": 50000 },
    { "date": "2024-01-02", "amount": 75000 }
  ],
  "topSellingItems": [
    { "name": "Gold Ring", "sold": 15 },
    { "name": "Silver Necklace", "sold": 10 }
  ]
}
```

---

## 🗄 Database Models

### User Model

```javascript
{
  _id: ObjectId,
  userName: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['Admin', 'Manager', 'Staff'], default: 'Staff'),
  createdAt: Date,
  updatedAt: Date
}
```

### JewelryItem Model

```javascript
{
  _id: ObjectId,
  itemCode: String (required, unique),
  name: String (required),
  description: String,
  note: String,
  category: String (required),
  grossWeight: Number (required),
  netWeight: Number (required),
  source: String (required),
  huid: String (required),
  images: [String],
  stockQty: Number (required, default: 1),
  createdAt: Date,
  updatedAt: Date
}
```

### Customer Model

```javascript
{
  _id: ObjectId,
  name: String (required),
  phone: String (required),
  email: String,
  address: String,
  panNumber: String,
  note: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model

```javascript
{
  _id: ObjectId,
  customerId: ObjectId (ref: 'Customer'),
  items: [{
    itemCode: String,
    qty: Number,
    price: Number
  }],
  totalWeight: Number,
  totalAmount: Number,
  status: String (enum: ['Placed', 'Processing', 'Completed', 'Cancelled']),
  date: Date,
  payments: [{
    mode: String (enum: ['Cash', 'Online', 'UPI']),
    amount: Number
  }],
  createdAt: Date
}
```

### LedgerEntry Model

```javascript
{
  _id: ObjectId,
  customerId: ObjectId (ref: 'Customer'),
  itemDetails: String,
  amount: Number,
  type: String (enum: ['Credit', 'Debit']),
  date: Date,
  note: String
}
```

## 🔒 Authentication & Authorization

### Roles & Permissions

- **Admin**: Full access to all features
- **Manager**: Can manage items, customers, orders; cannot delete items
- **Staff**: Read-only access to most features, can create orders

### Protected Routes

All routes except `/api/auth/*` require authentication. Include JWT token in Authorization header.

## 🧪 Testing

### Postman Collection

Import `Jewellify_Postman_Collection.json` for complete API testing.

### Test Coverage

- Authentication (register, login, validation)
- CRUD operations for all entities
- File upload functionality
- Error handling and validation
- Role-based access control

### Sample Test Data

The Postman collection includes sample data for:

- User registration and login
- Jewelry items with images
- Customer profiles
- Orders with payments
- Quotations and dashboard analytics

## 🚀 Deployment

### Production Environment

1. Set `NODE_ENV=production` in environment
2. Configure production MongoDB URI
3. Set up proper JWT secret
4. Configure email service for notifications
5. Set up file storage (AWS S3 recommended for production)

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@jewellify.com or create an issue in the repository.

---

**Built with ❤️ for jewelers, by developers**
