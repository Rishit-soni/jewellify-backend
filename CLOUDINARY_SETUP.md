# Cloudinary Image Upload Setup Guide

## Overview
This application now uses **Cloudinary** for cloud-based image storage instead of local disk storage. Users can upload up to **5 images per item**.

## Configuration Steps

### 1. Get Your Cloudinary Credentials

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Sign in or create a free account
3. On the dashboard, you'll find your credentials:
   - **Cloud Name**: `dslspwumc` (already configured)
   - **API Key**: Found on the dashboard
   - **API Secret**: Found on the dashboard (click "Reveal" to see it)

### 2. Update the `.env` File

Replace the placeholders in your `.env` file:

```env
CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@dslspwumc
```

**Example:**
```env
CLOUDINARY_URL=cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz123456@dslspwumc
```

⚠️ **Important:** Never commit your `.env` file to version control!

### 3. Restart Your Server

After updating the `.env` file, restart your development server:

```bash
npm run dev
```

## Features

### ✅ What's Implemented

1. **Cloud Storage**: Images are stored on Cloudinary, not on your local server
2. **5 Image Limit**: Maximum 5 images per item (enforced on both create and update)
3. **Automatic Optimization**: Images are automatically optimized by Cloudinary
4. **Image Resizing**: Large images are automatically resized to max 1000x1000px
5. **Format Support**: Supports JPG, JPEG, PNG, GIF, and WebP formats
6. **File Size Limit**: 5MB per image file
7. **Organized Storage**: All images stored in `jewellify-items` folder on Cloudinary

### 📝 API Endpoints

#### Create Item with Images
```http
POST /api/items
Content-Type: multipart/form-data
Authorization: Bearer <token>

Fields:
- name: string (required)
- category: string (required)
- grossWeight: number (required)
- netWeight: number (required)
- source: string (required)
- huid: string (required)
- labour.mode: string (required) - one of: percentage_per_gram, rupees_per_gram, fixed_amount
- labour.amount: number (required)
- images: file[] (optional, max 5 files)
- description: string (optional)
- note: string (optional)
- otherCharges: JSON array (optional)
```

**Example using Postman:**
1. Set method to POST
2. URL: `http://localhost:3000/api/items`
3. Headers: Add `Authorization: Bearer <your_token>`
4. Body: Select "form-data"
5. Add text fields for name, category, etc.
6. Add files by selecting "File" type and choosing "images" as key (you can add multiple files with the same key)

#### Update Item with Additional Images
```http
PUT /api/items/:id
Content-Type: multipart/form-data
Authorization: Bearer <token>

Fields:
- Any item fields you want to update
- images: file[] (optional, will be added to existing images)
```

**Note:** When updating, new images are **added** to existing ones. The total cannot exceed 5.

#### Delete Individual Image from Item
```http
DELETE /api/items/:id/images
Content-Type: application/json
Authorization: Bearer <token>

Body:
{
  "imageUrl": "https://res.cloudinary.com/dslspwumc/image/upload/v1234567890/jewellify-items/abc123.jpg"
}
```

**Response:**
```json
{
  "message": "Image deleted successfully",
  "remainingImages": 3,
  "item": { /* updated item object */ }
}
```

**Note:** This endpoint removes a specific image from both Cloudinary and the item's database record.

### 🔒 Validation Rules

1. **On Create:**
   - Maximum 5 images can be uploaded
   - Returns error if more than 5 images are provided

2. **On Update:**
   - New images are added to existing images
   - Total images (existing + new) cannot exceed 5
   - Error response includes:
     - Current image count
     - Number of images being added
     - What the total would be

### 📊 Response Examples

#### Success Response (Create)
```json
{
  "message": "Item created successfully",
  "item": {
    "_id": "507f1f77bcf86cd799439011",
    "tenantId": "507f1f77bcf86cd799439012",
    "itemCode": "GR01",
    "name": "Gold Ring",
    "category": "Gold Ring",
    "images": [
      "https://res.cloudinary.com/dslspwumc/image/upload/v1234567890/jewellify-items/abc123.jpg",
      "https://res.cloudinary.com/dslspwumc/image/upload/v1234567890/jewellify-items/def456.jpg"
    ],
    // ... other fields
  }
}
```

#### Error Response (Too Many Images on Create)
```json
{
  "message": "Maximum 5 images allowed per item",
  "currentCount": 6
}
```

#### Error Response (Too Many Images on Update)
```json
{
  "message": "Maximum 5 images allowed per item",
  "currentCount": 3,
  "attemptingToAdd": 3,
  "totalWouldBe": 6
}
```

### 🖼️ Image URLs

Images are stored as full Cloudinary URLs in the database:
```
https://res.cloudinary.com/dslspwumc/image/upload/v1234567890/jewellify-items/filename.jpg
```

You can use these URLs directly in your frontend:
```html
<img src="https://res.cloudinary.com/dslspwumc/image/upload/v1234567890/jewellify-items/filename.jpg" alt="Item">
```

### 🎨 Cloudinary Transformations

You can modify image URLs to apply transformations on-the-fly:

**Original:**
```
https://res.cloudinary.com/dslspwumc/image/upload/v1234567890/jewellify-items/filename.jpg
```

**Thumbnail (200x200):**
```
https://res.cloudinary.com/dslspwumc/image/upload/w_200,h_200,c_fill/v1234567890/jewellify-items/filename.jpg
```

**Grayscale:**
```
https://res.cloudinary.com/dslspwumc/image/upload/e_grayscale/v1234567890/jewellify-items/filename.jpg
```

[Learn more about Cloudinary transformations](https://cloudinary.com/documentation/image_transformations)

## Testing

### Test with cURL

**Create item with images:**
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Gold Ring" \
  -F "category=Gold Ring" \
  -F "grossWeight=10.5" \
  -F "netWeight=9.8" \
  -F "source=Purchase" \
  -F "huid=HUID123456" \
  -F "labour.mode=fixed_amount" \
  -F "labour.amount=500" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

### Test with Postman

1. Import the `Jewellify_Postman_Collection.json` file
2. Update the "Create Item" request to include file uploads
3. Test creating items with 1-5 images
4. Test creating items with more than 5 images (should fail)
5. Test updating items to ensure total doesn't exceed 5

## Troubleshooting

### Error: "cloudinary_url is not defined"
- Make sure you've added `CLOUDINARY_URL` to your `.env` file
- Restart your server after updating `.env`

### Error: "Only image files are allowed"
- Ensure you're uploading image files (JPG, PNG, GIF, WEBP)
- Check the file extension and MIME type

### Error: "File too large"
- Each image must be under 5MB
- Compress your images before uploading

### Images not appearing
- Check that the Cloudinary URL in `.env` is correct
- Verify your API key and secret are valid
- Check Cloudinary dashboard to see if images are being uploaded

## Benefits of Cloudinary

1. **Scalability**: No need to manage local storage
2. **CDN**: Fast image delivery worldwide
3. **Automatic Optimization**: Images are automatically optimized for web
4. **Transformations**: Resize, crop, and apply effects on-the-fly
5. **Backup**: Images are safely stored in the cloud
6. **Free Tier**: 25GB storage and 25GB bandwidth per month

## Next Steps

1. ✅ Add your Cloudinary credentials to `.env`
2. ✅ Restart your server
3. ✅ Test creating items with images
4. ✅ Test updating items with additional images
5. ✅ Test deleting individual images from items
6. ✅ Verify images appear in your Cloudinary dashboard
7. Consider adding image reordering functionality
8. Consider adding bulk image upload functionality

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Multer Storage Cloudinary](https://github.com/affanshahid/multer-storage-cloudinary)
