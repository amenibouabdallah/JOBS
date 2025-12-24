'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera } from 'lucide-react'; // Removed 'Upload' as it's not used
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils/image-url';
import uploadsService from '@/lib/services/uploads.service';
import { apiClient } from '@/lib/api-client';

interface ImageUploadProps {
  currentImage?: string;
  onImageUpdate: (imageUrl: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fallbackText: string;
  mode?: 'local' | 'none';
  profileUpdateEndpoint?: string; // New prop for profile update endpoint
}

export function ImageUpload({
  currentImage,
  onImageUpdate,
  className = '',
  size = 'md',
  fallbackText,
  profileUpdateEndpoint, // Destructure new prop
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32'
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format non supporté. Utilisez JPG, PNG ou GIF');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(`La taille de l'image ne doit pas dépasser 10MB (taille actuelle: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      return;
    }

    setFileToUpload(file);
    setPreviewUrl(URL.createObjectURL(file));
    // Do not call onImageUpdate here, it will be called on validation
  };

  const handleUpload = async () => {
    if (!fileToUpload) return;

    setIsUploading(true);
    try {
      // Step 1: Upload the file to the generic uploads service
      const uploadResponse = await uploadsService.uploadFile(fileToUpload, 'profiles', '(jpg|jpeg|png|gif)');
      const imageUrl = uploadResponse.url;

      // Step 2: If a profileUpdateEndpoint is provided, call it to update the user's profile
      if (profileUpdateEndpoint) {
        console.log('ImageUpload - profileUpdateEndpoint:', profileUpdateEndpoint);
        console.log('ImageUpload - Updating profile with img:', imageUrl);
        // apiClient already has baseURL configured, just use the endpoint path
        await apiClient.patch(profileUpdateEndpoint, { img: imageUrl });
      }

      onImageUpdate(imageUrl); // Notify parent component with the final URL
      setFileToUpload(null);
      setPreviewUrl(null);
      toast.success('Image téléchargée avec succès !');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Échec du téléchargement de l\'image.');
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <div className="relative">
        <Avatar className={`${sizeClasses[size]} rounded-full border border-gray-300 dark:border-gray-600`}>
          <AvatarImage
            src={previewUrl || getImageUrl(currentImage) || undefined}
            alt="Profile Image"
          />
          <AvatarFallback>{fallbackText.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={handleFileSelect}
          aria-label="Upload Image"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>
      {fileToUpload && (
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="mt-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 text-white px-6 py-2 rounded-lg font-medium shadow-lg transition-all duration-200"
        >
          {isUploading ? 'Téléchargement...' : 'Valider cette image'}
        </Button>
      )}
    </div>
  );
}