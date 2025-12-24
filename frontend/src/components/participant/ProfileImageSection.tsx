import React from 'react';
import { ImageUpload } from '@/components/ui/image-upload';
import { Participant } from '@/types/participant.types';

interface ProfileImageSectionProps {
  participant: Participant | null;
  handleImageUpdate: (imageUrl: string) => void;
}

export const ProfileImageSection: React.FC<ProfileImageSectionProps> = ({ participant, handleImageUpdate }) => {
  return (
    <div className="text-center">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center justify-center gap-2">
        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
        Photo de Profil
        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
      </h3>
      <div className="flex justify-center">
        <ImageUpload
          currentImage={participant?.user?.img || ''}
          onImageUpdate={handleImageUpdate}
          mode="local"
          size="lg"
          fallbackText={`${participant?.firstName?.charAt(0) || ''}${participant?.lastName?.charAt(0) || ''}`}
          profileUpdateEndpoint="/participant/profile"
        />
      </div>
    </div>
  );
};
