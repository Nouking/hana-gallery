import React from 'react';
import { usePhotoStore } from '../store/photoStore';
import { googlePhotosService } from '../services/googlePhotos';
import { LogIn, LogOut, RefreshCw, SortAsc, SortDesc, Camera, AlertCircle, X } from 'lucide-react';

const GalleryHeader: React.FC = () => {
  const {
    isSignedIn,
    isLoading,
    error,
    sortOrder,
    photos,
    setSignedIn,
    setLoading,
    setError,
    setPhotos,
    setSortOrder,
    clearError
  } = usePhotoStore();

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const success = await googlePhotosService.signIn();
      setSignedIn(success);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    googlePhotosService.signOut();
    setSignedIn(false);
    setPhotos([]);
    setError(null);
  };

  const handleSyncPhotos = async () => {
    if (!isSignedIn) {
      setError('Please sign in first to sync photos');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const photos = await googlePhotosService.getTestAlbumPhotos();
      setPhotos(photos);
      
      // Save to localStorage for public access
      localStorage.setItem('gallery-photos', JSON.stringify(photos));
      localStorage.setItem('last-sync', new Date().toISOString());
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sync photos');
    } finally {
      setLoading(false);
    }
  };

  const loadCachedPhotos = () => {
    try {
      const cachedPhotos = localStorage.getItem('gallery-photos');
      if (cachedPhotos) {
        const photos = JSON.parse(cachedPhotos);
        setPhotos(photos);
        setError(null);
      } else {
        setError('No cached photos found. Please sync photos first.');
      }
    } catch (error) {
      setError('Failed to load cached photos');
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
  };

  const getLastSyncTime = () => {
    const lastSync = localStorage.getItem('last-sync');
    if (lastSync) {
      return new Date(lastSync).toLocaleString();
    }
    return 'Never';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <Camera className="text-blue-600" size={32} />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Hana Gallery</h1>
              <p className="text-xs text-gray-500">Test Album Photos</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Photo Count & Last Sync */}
            {photos.length > 0 && (
              <div className="hidden sm:block text-sm text-gray-500">
                <div>{photos.length} photos</div>
                <div className="text-xs">Last sync: {getLastSyncTime()}</div>
              </div>
            )}

            {/* Sort Toggle */}
            {photos.length > 0 && (
              <button
                onClick={toggleSortOrder}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title={`Sort by ${sortOrder === 'newest' ? 'oldest' : 'newest'} first`}
              >
                {sortOrder === 'newest' ? <SortDesc size={16} /> : <SortAsc size={16} />}
                <span className="hidden sm:inline">
                  {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                </span>
              </button>
            )}

            {/* Load Cached Photos */}
            <button
              onClick={loadCachedPhotos}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
              title="Load cached photos"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Load Cached</span>
            </button>

            {/* Sync Photos */}
            <button
              onClick={handleSyncPhotos}
              disabled={!isSignedIn || isLoading}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Sync photos from Google Photos"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">
                {isLoading ? 'Syncing...' : 'Sync Photos'}
              </span>
            </button>

            {/* Authentication */}
            {isSignedIn ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <LogIn size={16} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="text-red-400 mr-2" size={20} />
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!isSignedIn && photos.length === 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <div className="flex items-start">
              <AlertCircle className="text-blue-400 mr-2 mt-0.5" size={20} />
              <div className="text-blue-700">
                <h3 className="font-medium">Getting Started</h3>
                <div className="mt-2 text-sm">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Create a <code className="bg-blue-100 px-1 rounded">.env.local</code> file with your Google API credentials</li>
                    <li>Click "Sign In" to authenticate with Google</li>
                    <li>Click "Sync Photos" to load photos from the Test album</li>
                    <li>Or click "Load Cached" if photos were previously synced</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default GalleryHeader; 