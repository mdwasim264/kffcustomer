/**
 * Cloudinary पर इमेज अपलोड करने का फंक्शन
 * @param file - जो फाइल अपलोड करनी है
 * @returns - अपलोड की गई इमेज का URL
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = "YOUR_CLOUD_NAME"; // अपना Cloud Name यहाँ डालें
  const uploadPreset = "YOUR_UPLOAD_PRESET"; // अपना Unsigned Upload Preset यहाँ डालें

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
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};