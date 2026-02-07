const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Parse Cloudinary URL from environment variable
const cloudinaryUrl = process.env.CLOUDINARY_URL;
if (cloudinaryUrl) {
  const urlMatch = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
  if (urlMatch) {
    const [, api_key, api_secret, cloud_name] = urlMatch;
    cloudinary.config({
      cloud_name: cloud_name,
      api_key: api_key,
      api_secret: api_secret,
    });
  }
}


/**
 * Delete a single image from Cloudinary
 * @param {string} imageUrl - Full Cloudinary URL
 * @returns {Promise<object>} - Deletion result
 */
const deleteImage = async (imageUrl) => {
  try {
    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
    const urlParts = imageUrl.split("/");
    const versionIndex = urlParts.findIndex((part) => part.startsWith("v"));
    
    if (versionIndex === -1) {
      throw new Error("Invalid Cloudinary URL format");
    }
    
    // Get everything after version (folder/filename.ext)
    const pathWithExtension = urlParts.slice(versionIndex + 1).join("/");
    
    // Remove file extension to get public_id
    const publicId = pathWithExtension.replace(/\.[^/.]+$/, "");
    
    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw error;
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {string[]} imageUrls - Array of Cloudinary URLs
 * @returns {Promise<object[]>} - Array of deletion results
 */
const deleteImages = async (imageUrls) => {
  try {
    const deletePromises = imageUrls.map((url) => deleteImage(url));
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    console.error("Error deleting images from Cloudinary:", error);
    throw error;
  }
};

/**
 * Extract public_id from Cloudinary URL
 * @param {string} imageUrl - Full Cloudinary URL
 * @returns {string} - Public ID
 */
const getPublicIdFromUrl = (imageUrl) => {
  try {
    const urlParts = imageUrl.split("/");
    const versionIndex = urlParts.findIndex((part) => part.startsWith("v"));
    
    if (versionIndex === -1) {
      throw new Error("Invalid Cloudinary URL format");
    }
    
    const pathWithExtension = urlParts.slice(versionIndex + 1).join("/");
    const publicId = pathWithExtension.replace(/\.[^/.]+$/, "");
    
    return publicId;
  } catch (error) {
    console.error("Error extracting public_id:", error);
    throw error;
  }
};

module.exports = {
  deleteImage,
  deleteImages,
  getPublicIdFromUrl,
};
