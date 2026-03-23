/**
 * Cloudinary पर इमेज अपलोड करने का फंक्शन
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
  // .env फ़ाइल से वैल्यू लेने की कोशिश करें, वरना आपके दिए गए डिफॉल्ट्स इस्तेमाल करें
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dwrtx3sff";
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "kff_admin_preset";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};