# Quick API Reference - Image Upload

## 🚀 Quick Start

### 1. Add Cloudinary Credentials
```env
# .env file
CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@dslspwumc
```

### 2. Restart Server
```bash
npm run dev
```

---

## 📸 API Endpoints Summary

### Create Item with Images
**Endpoint:** `POST /api/items`  
**Max Images:** 5  
**Auth:** Required (Admin/Manager)

```bash
# Example with cURL
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
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

---

### Update Item (Add More Images)
**Endpoint:** `PUT /api/items/:id`  
**Max Total Images:** 5 (existing + new)  
**Auth:** Required (Admin/Manager)

```bash
# Example: Add 2 more images to existing item
curl -X PUT http://localhost:3000/api/items/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@image3.jpg" \
  -F "images=@image4.jpg"
```

**Validation:**
- If item has 3 images, you can add max 2 more
- If item has 5 images, you cannot add any more

---

### Delete Individual Image
**Endpoint:** `DELETE /api/items/:id/images`  
**Auth:** Required (Admin/Manager)

```bash
# Example: Delete specific image
curl -X DELETE http://localhost:3000/api/items/507f1f77bcf86cd799439011/images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://res.cloudinary.com/dslspwumc/image/upload/v1234567890/jewellify-items/abc123.jpg"
  }'
```

**Response:**
```json
{
  "message": "Image deleted successfully",
  "remainingImages": 2,
  "item": { /* updated item */ }
}
```

---

### Delete Item (Deletes All Images)
**Endpoint:** `DELETE /api/items/:id`  
**Auth:** Required (Admin only)

```bash
curl -X DELETE http://localhost:3000/api/items/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Note:** Automatically deletes all associated images from Cloudinary

---

## ⚠️ Validation Rules

| Action | Rule | Error Response |
|--------|------|----------------|
| Create | Max 5 images | `"Maximum 5 images allowed per item"` |
| Update | Total ≤ 5 images | Shows current, adding, and total count |
| File Size | Max 5MB per file | `"File too large"` |
| File Type | Images only | `"Only image files are allowed"` |

---

## 📊 Response Format

### Success (Create/Update)
```json
{
  "message": "Item created successfully",
  "item": {
    "_id": "507f1f77bcf86cd799439011",
    "images": [
      "https://res.cloudinary.com/dslspwumc/image/upload/v1234567890/jewellify-items/abc123.jpg",
      "https://res.cloudinary.com/dslspwumc/image/upload/v1234567890/jewellify-items/def456.jpg"
    ]
  }
}
```

### Error (Too Many Images on Update)
```json
{
  "message": "Maximum 5 images allowed per item",
  "currentCount": 4,
  "attemptingToAdd": 2,
  "totalWouldBe": 6
}
```

---

## 🎨 Image Transformations

Cloudinary allows on-the-fly transformations by modifying the URL:

### Original
```
https://res.cloudinary.com/dslspwumc/image/upload/v1234567890/jewellify-items/abc123.jpg
```

### Thumbnail (200x200, cropped)
```
https://res.cloudinary.com/dslspwumc/image/upload/w_200,h_200,c_fill/v1234567890/jewellify-items/abc123.jpg
```

### Thumbnail (200x200, fit)
```
https://res.cloudinary.com/dslspwumc/image/upload/w_200,h_200,c_fit/v1234567890/jewellify-items/abc123.jpg
```

### Quality Optimization (auto quality, auto format)
```
https://res.cloudinary.com/dslspwumc/image/upload/q_auto,f_auto/v1234567890/jewellify-items/abc123.jpg
```

---

## 🧪 Testing Checklist

- [ ] Create item with 1 image ✓
- [ ] Create item with 5 images ✓
- [ ] Create item with 6 images (should fail) ✗
- [ ] Update item: add images (total ≤ 5) ✓
- [ ] Update item: add images (total > 5) (should fail) ✗
- [ ] Delete individual image ✓
- [ ] Delete item (all images deleted) ✓
- [ ] Upload non-image file (should fail) ✗
- [ ] Upload file > 5MB (should fail) ✗

---

## 🔧 Common Issues

### Issue: "cloudinary_url is not defined"
**Solution:** Add `CLOUDINARY_URL` to `.env` and restart server

### Issue: Images not uploading
**Solution:** 
1. Check Cloudinary credentials
2. Check file size (< 5MB)
3. Check file type (must be image)
4. Check Cloudinary dashboard for errors

### Issue: "Maximum 5 images allowed"
**Solution:** Delete some images first using the delete image endpoint

---

## 📱 Postman Collection

Update your Postman collection with these endpoints:

1. **Create Item** - Use form-data with file uploads
2. **Update Item** - Use form-data with file uploads
3. **Delete Image** - Use JSON body with imageUrl
4. **Delete Item** - Simple DELETE request

---

## 🔗 Useful Links

- [Cloudinary Dashboard](https://cloudinary.com/console)
- [Cloudinary Transformations](https://cloudinary.com/documentation/image_transformations)
- [Full Setup Guide](./CLOUDINARY_SETUP.md)
