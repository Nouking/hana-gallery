import React, { useEffect } from 'react';
import GalleryHeader from './components/GalleryHeader';
import PhotoGallery from './components/PhotoGallery';
import { usePhotoStore } from './store/photoStore';
import './App.css';

function App() {
  const { photos, isLoading, setPhotos } = usePhotoStore();

  // Load cached photos on app start
  useEffect(() => {
    const cachedPhotos = localStorage.getItem('gallery-photos');
    if (cachedPhotos) {
      try {
        const photos = JSON.parse(cachedPhotos);
        setPhotos(photos);
      } catch (error) {
        console.error('Failed to load cached photos:', error);
      }
    }
  }, [setPhotos]);

  return (
    <div className="min-h-screen bg-gray-50">
      <GalleryHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && photos.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading photos...</p>
            </div>
          </div>
        )}
        
        <PhotoGallery />
      </main>
    </div>
  );
}

export default App;
