# Frontend Integration Guide - Cloudinary Image Upload

## 🎯 Overview

Your backend is **fully configured** and ready to handle Cloudinary image uploads. The cURL request you provided shows the frontend is sending data correctly. Here's what you need to know for frontend integration.

---

## ✅ Backend Status

**All backend changes are complete:**
- ✅ Cloudinary credentials configured
- ✅ Upload middleware updated
- ✅ 5-image limit enforced
- ✅ Image validation working
- ✅ Server running on port 3000

---

## 📤 Frontend Requirements

### **1. Image Upload (Create Item)**

Your frontend is already sending the request correctly! The cURL shows:

```http
POST http://localhost:3000/api/items
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- name: "Ladies bracelet"
- category: "Ladies bracelet"
- source: "456"
- grossWeight: 5
- netWeight: 5
- huid: "646"
- labour.mode: "percentage_per_gram"
- labour.amount: 6
- otherCharges: [{"name":"HALL MARK","amount":520}]
- images: [File1, File2]  // Multiple files with same key
```

**This is perfect!** ✅ No changes needed for create.

---

### **2. What Changed on Backend**

#### **Before (Local Storage):**
```json
{
  "images": [
    "1234567890-123456789.jpg",
    "1234567890-987654321.jpg"
  ]
}
```

#### **After (Cloudinary):**
```json
{
  "images": [
    "https://res.cloudinary.com/dslspwumc/image/upload/v1234567890/jewellify-items/abc123.jpg",
    "https://res.cloudinary.com/dslspwumc/image/upload/v1234567890/jewellify-items/def456.jpg"
  ]
}
```

**Impact on Frontend:**
- ✅ Images are now **full URLs** instead of filenames
- ✅ You can use these URLs directly in `<img>` tags
- ❌ No need to prepend `/uploads/` anymore

---

## 🔧 Frontend Changes Required

### **1. Display Images**

#### **Old Code (Local Storage):**
```typescript
// Angular/TypeScript
getImageUrl(filename: string): string {
  return `http://localhost:3000/uploads/${filename}`;
}
```

```html
<!-- Template -->
<img [src]="getImageUrl(item.images[0])" alt="Item">
```

#### **New Code (Cloudinary):**
```typescript
// Angular/TypeScript
getImageUrl(imageUrl: string): string {
  // If it's already a full URL (Cloudinary), return as-is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  // Fallback for old local images (backward compatibility)
  return `http://localhost:3000/uploads/${imageUrl}`;
}
```

```html
<!-- Template -->
<img [src]="getImageUrl(item.images[0])" alt="Item">
```

**Or simply:**
```html
<!-- Template - Direct URL -->
<img [src]="item.images[0]" alt="Item">
```

---

### **2. Image Upload (No Changes Needed)**

Your current upload code should work as-is:

```typescript
// Angular/TypeScript
uploadItem(formData: FormData) {
  return this.http.post('http://localhost:3000/api/items', formData, {
    headers: {
      'Authorization': `Bearer ${this.token}`
      // Don't set Content-Type - let browser set it with boundary
    }
  });
}
```

**Building FormData:**
```typescript
const formData = new FormData();
formData.append('name', 'Ladies bracelet');
formData.append('category', 'Ladies bracelet');
formData.append('grossWeight', '5');
formData.append('netWeight', '5');
formData.append('source', '456');
formData.append('huid', '646');
formData.append('labour.mode', 'percentage_per_gram');
formData.append('labour.amount', '6');
formData.append('otherCharges', JSON.stringify([{name: 'HALL MARK', amount: 520}]));

// Add multiple images with same key
for (let file of this.selectedFiles) {
  formData.append('images', file, file.name);
}
```

---

### **3. Image Validation (Frontend)**

Add validation to prevent uploading more than 5 images:

```typescript
// Angular/TypeScript
selectedFiles: File[] = [];
maxImages = 5;

onFileSelect(event: any) {
  const files = Array.from(event.target.files) as File[];
  
  // Check total count
  if (this.selectedFiles.length + files.length > this.maxImages) {
    alert(`Maximum ${this.maxImages} images allowed`);
    return;
  }
  
  // Check file size (5MB per file)
  const maxSize = 5 * 1024 * 1024; // 5MB
  for (let file of files) {
    if (file.size > maxSize) {
      alert(`File ${file.name} is too large. Maximum 5MB per file.`);
      return;
    }
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  for (let file of files) {
    if (!allowedTypes.includes(file.type)) {
      alert(`File ${file.name} is not an image.`);
      return;
    }
  }
  
  this.selectedFiles.push(...files);
}

removeFile(index: number) {
  this.selectedFiles.splice(index, 1);
}
```

```html
<!-- Template -->
<input 
  type="file" 
  (change)="onFileSelect($event)" 
  accept="image/*" 
  multiple
  [disabled]="selectedFiles.length >= maxImages">

<div *ngFor="let file of selectedFiles; let i = index">
  {{ file.name }}
  <button (click)="removeFile(i)">Remove</button>
</div>

<p>{{ selectedFiles.length }} / {{ maxImages }} images selected</p>
```

---

### **4. Update Item (Add More Images)**

When updating an item to add more images:

```typescript
// Angular/TypeScript
updateItem(itemId: string, formData: FormData) {
  return this.http.put(`http://localhost:3000/api/items/${itemId}`, formData, {
    headers: {
      'Authorization': `Bearer ${this.token}`
    }
  });
}
```

**Important:** Check existing image count before adding:

```typescript
addMoreImages(item: any, newFiles: File[]) {
  const currentCount = item.images.length;
  const newCount = newFiles.length;
  const totalCount = currentCount + newCount;
  
  if (totalCount > 5) {
    alert(`Cannot add ${newCount} images. Item already has ${currentCount} images. Maximum is 5.`);
    return;
  }
  
  const formData = new FormData();
  for (let file of newFiles) {
    formData.append('images', file, file.name);
  }
  
  this.updateItem(item._id, formData).subscribe(
    response => console.log('Images added', response),
    error => console.error('Error', error)
  );
}
```

---

### **5. Delete Individual Image (NEW)**

New endpoint to delete specific images:

```typescript
// Angular/TypeScript
deleteImage(itemId: string, imageUrl: string) {
  return this.http.delete(`http://localhost:3000/api/items/${itemId}/images`, {
    headers: {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    },
    body: { imageUrl }
  });
}
```

**Usage:**
```typescript
onDeleteImage(item: any, imageUrl: string) {
  if (confirm('Are you sure you want to delete this image?')) {
    this.deleteImage(item._id, imageUrl).subscribe(
      response => {
        console.log('Image deleted', response);
        // Update local item object
        item.images = item.images.filter(img => img !== imageUrl);
      },
      error => console.error('Error deleting image', error)
    );
  }
}
```

```html
<!-- Template -->
<div *ngFor="let imageUrl of item.images">
  <img [src]="imageUrl" alt="Item">
  <button (click)="onDeleteImage(item, imageUrl)">Delete</button>
</div>
```

---

## 🎨 Image Transformations (Bonus)

Cloudinary allows on-the-fly transformations. You can optimize images for different use cases:

```typescript
// Angular/TypeScript
getImageUrl(imageUrl: string, transformation?: string): string {
  if (!imageUrl.startsWith('http')) {
    return `http://localhost:3000/uploads/${imageUrl}`;
  }
  
  // Apply transformation if provided
  if (transformation) {
    // Insert transformation before /upload/
    return imageUrl.replace('/upload/', `/upload/${transformation}/`);
  }
  
  return imageUrl;
}
```

**Usage:**
```html
<!-- Thumbnail (200x200) -->
<img [src]="getImageUrl(item.images[0], 'w_200,h_200,c_fill')" alt="Thumbnail">

<!-- Medium (500x500) -->
<img [src]="getImageUrl(item.images[0], 'w_500,h_500,c_fit')" alt="Medium">

<!-- Auto-optimized -->
<img [src]="getImageUrl(item.images[0], 'q_auto,f_auto')" alt="Optimized">

<!-- Original -->
<img [src]="getImageUrl(item.images[0])" alt="Original">
```

---

## 🚨 Error Handling

### **Backend Error Responses**

#### **Too Many Images (Create)**
```json
{
  "message": "Maximum 5 images allowed per item",
  "currentCount": 6
}
```

#### **Too Many Images (Update)**
```json
{
  "message": "Maximum 5 images allowed per item",
  "currentCount": 3,
  "attemptingToAdd": 3,
  "totalWouldBe": 6
}
```

#### **File Too Large**
```json
{
  "message": "File too large"
}
```

#### **Invalid File Type**
```json
{
  "message": "Only image files are allowed"
}
```

### **Frontend Error Handling**

```typescript
uploadItem(formData: FormData) {
  this.http.post('http://localhost:3000/api/items', formData).subscribe(
    response => {
      console.log('Success', response);
      this.router.navigate(['/items']);
    },
    error => {
      if (error.status === 400) {
        // Validation error
        if (error.error.message.includes('Maximum 5 images')) {
          alert('Too many images! Maximum 5 images allowed per item.');
        } else if (error.error.message.includes('File too large')) {
          alert('One or more files are too large. Maximum 5MB per file.');
        } else if (error.error.message.includes('Only image files')) {
          alert('Please upload only image files.');
        } else {
          alert(error.error.message);
        }
      } else {
        alert('An error occurred. Please try again.');
      }
    }
  );
}
```

---

## 📋 Complete Example (Angular Component)

```typescript
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item.component.html'
})
export class CreateItemComponent {
  selectedFiles: File[] = [];
  maxImages = 5;
  
  constructor(private http: HttpClient) {}
  
  onFileSelect(event: any) {
    const files = Array.from(event.target.files) as File[];
    
    // Validate count
    if (this.selectedFiles.length + files.length > this.maxImages) {
      alert(`Maximum ${this.maxImages} images allowed`);
      return;
    }
    
    // Validate size and type
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    for (let file of files) {
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Max 5MB per file.`);
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name} is not an image.`);
        return;
      }
    }
    
    this.selectedFiles.push(...files);
  }
  
  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }
  
  onSubmit(form: any) {
    const formData = new FormData();
    
    // Add form fields
    formData.append('name', form.name);
    formData.append('category', form.category);
    formData.append('grossWeight', form.grossWeight);
    formData.append('netWeight', form.netWeight);
    formData.append('source', form.source);
    formData.append('huid', form.huid);
    formData.append('labour.mode', form.labourMode);
    formData.append('labour.amount', form.labourAmount);
    
    if (form.otherCharges) {
      formData.append('otherCharges', JSON.stringify(form.otherCharges));
    }
    
    // Add images
    for (let file of this.selectedFiles) {
      formData.append('images', file, file.name);
    }
    
    // Upload
    const token = localStorage.getItem('token');
    this.http.post('http://localhost:3000/api/items', formData, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe(
      response => {
        console.log('Item created', response);
        alert('Item created successfully!');
        this.selectedFiles = [];
      },
      error => {
        console.error('Error', error);
        alert(error.error?.message || 'An error occurred');
      }
    );
  }
}
```

---

## ✅ Summary - What Frontend Needs to Do

### **Minimal Changes (Recommended):**
1. ✅ **Display images:** Use image URLs directly (they're now full URLs)
2. ✅ **Add validation:** Prevent uploading more than 5 images
3. ✅ **Error handling:** Handle backend validation errors

### **Optional Enhancements:**
1. ⭐ **Delete images:** Implement delete individual image feature
2. ⭐ **Image transformations:** Use Cloudinary transformations for thumbnails
3. ⭐ **Progress indicators:** Show upload progress
4. ⭐ **Image preview:** Show preview before upload

### **No Changes Needed:**
- ✅ Upload logic (FormData) - Already working
- ✅ Authorization headers - Already correct
- ✅ API endpoints - Same URLs

---

## 🧪 Testing Your Frontend

1. **Create item with 1-5 images** - Should work ✓
2. **Try uploading 6 images** - Should show error ✗
3. **View item images** - Should display Cloudinary URLs ✓
4. **Update item with more images** - Should work if total ≤ 5 ✓
5. **Delete individual image** - Should work ✓

---

## 🆘 Troubleshooting

### **Images not displaying**
- Check if image URLs are full Cloudinary URLs
- Check browser console for CORS errors
- Verify Cloudinary URLs are accessible

### **Upload fails**
- Check file size (max 5MB per file)
- Check file type (images only)
- Check total image count (max 5)
- Check authorization token

### **CORS errors**
- Backend already allows `http://localhost:4200`
- Check if frontend is running on port 4200

---

## 📞 Need Help?

- Backend is ready and working ✅
- Cloudinary is configured ✅
- Your cURL request format is correct ✅

Just update your frontend to handle the new image URL format and add validation!
