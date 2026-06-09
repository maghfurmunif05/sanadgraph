/**
 * Cloudinary asset uploading service
 */

const cloudinaryCloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || '';
const cloudinaryUploadPreset = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || '';

export const isCloudinaryConfigured = !!(cloudinaryCloudName && cloudinaryUploadPreset);

/**
 * Uploads a local file to Cloudinary and returns the secure URL.
 * Falls back gracefully to local file storage / object URLs if credentials are not configured.
 */
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  if (!isCloudinaryConfigured) {
    console.warn('Cloudinary not configured, generating temporary object URL fallback.');
    return URL.createObjectURL(file);
  }

  try {
    const url = `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryUploadPreset);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.secure_url || '';
  } catch (error) {
    console.error('Cloudinary upload failed, falling back:', error);
    return URL.createObjectURL(file);
  }
};
