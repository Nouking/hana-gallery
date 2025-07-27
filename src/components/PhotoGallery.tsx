import React, { useState } from 'react';
import { usePhotoStore } from '../store/photoStore';
import { Photo } from '../types';
import { Calendar, Download, X } from 'lucide-react';

const PhotoGallery: React.FC = () => {
  const { getSortedPhotos } = usePhotoStore();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const photos = getSortedPhotos();

  const getImageUrl = (photo: Photo, size: 'small' | 'medium' | 'large') => {
    const sizes = {
      small: { w: 300, h: 300 },
      medium: { w: 800, h: 600 },
      large: { w: 1200, h: 900 }
    };
    const { w, h } = sizes[size];
    return `${photo.baseUrl}=w${w}-h${h}-c`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const downloadPhoto = (photo: Photo) => {
    const link = document.createElement('a');
    link.href = `${photo.baseUrl}=d`;
    link.download = photo.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">No photos found in the gallery</p>
        <p className="text-gray-400 text-sm mt-2">Make sure you're signed in and have access to the Test album</p>
      </div>
    );
  }

  return (
    <>
      {/* Photo Grid */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={getImageUrl(photo, 'small')}
              alt={photo.filename}
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end">
              <div className="p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} />
                  <span>{formatDate(photo.creationTime)}</span>
                </div>
                {photo.description && (
                  <p className="text-xs mt-1 opacity-90">{photo.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Download Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadPhoto(selectedPhoto);
              }}
              className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
            >
              <Download size={24} />
            </button>

            {/* Photo */}
            <img
              src={getImageUrl(selectedPhoto, 'large')}
              alt={selectedPhoto.filename}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Photo Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
              <h3 className="font-semibold text-lg">{selectedPhoto.filename}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>{formatDate(selectedPhoto.creationTime)}</span>
                </div>
                <span>
                  {selectedPhoto.mediaMetadata.width} × {selectedPhoto.mediaMetadata.height}
                </span>
              </div>
              {selectedPhoto.description && (
                <p className="mt-2 text-sm opacity-90">{selectedPhoto.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGallery; 