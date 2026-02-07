require("dotenv").config();

console.log("Testing Cloudinary Configuration...\n");

// Check if CLOUDINARY_URL exists
const cloudinaryUrl = process.env.CLOUDINARY_URL;
console.log("1. CLOUDINARY_URL exists:", !!cloudinaryUrl);

if (cloudinaryUrl) {
  console.log("2. CLOUDINARY_URL format:", cloudinaryUrl.substring(0, 30) + "...");
  
  // Parse the URL
  const urlMatch = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
  
  if (urlMatch) {
    const [, api_key, api_secret, cloud_name] = urlMatch;
    console.log("3. Parsed successfully:");
    console.log("   - Cloud Name:", cloud_name);
    console.log("   - API Key:", api_key);
    console.log("   - API Secret:", api_secret.substring(0, 5) + "...");
    
    // Test Cloudinary configuration
    const cloudinary = require("cloudinary").v2;
    cloudinary.config({
      cloud_name: cloud_name,
      api_key: api_key,
      api_secret: api_secret,
    });
    
    console.log("\n4. Cloudinary configured successfully!");
    console.log("   Config:", {
      cloud_name: cloudinary.config().cloud_name,
      api_key: cloudinary.config().api_key,
    });
  } else {
    console.log("❌ ERROR: Invalid CLOUDINARY_URL format");
    console.log("   Expected: cloudinary://api_key:api_secret@cloud_name");
  }
} else {
  console.log("❌ ERROR: CLOUDINARY_URL not found in .env file");
}

console.log("\n✅ Configuration test complete!");
