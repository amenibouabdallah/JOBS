/**
 * Constructs the full image URL for images stored on the backend
 * @param imagePath - The image path stored in DB (e.g., "/uploads/profiles/abc123.png")
 * @returns The full URL to access the image
 */
export function getImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a data URL (base64), return as-is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3020';
  
  // Simply prepend backend URL to the path and add a cache-busting timestamp
  return `${backendUrl}${imagePath}?_t=${Date.now()}`;
}
