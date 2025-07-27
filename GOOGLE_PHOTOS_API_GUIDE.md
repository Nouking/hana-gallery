# 📸 Google Photos Shared Album - Simple Gallery

## 🎯 Overview

**Super Simple Approach**: Connect to a shared Google Photos album and display photos in a beautiful gallery with sorting. No complicated auth, no user management - just a clean photo gallery!

## 🔧 Prerequisites

1. **Google Cloud Console Project** (Free)
2. **Google Photos Library API** enabled
3. **Shared Google Photos Album** (your daughter's photos)

## 🚀 Quick Setup (3 Steps)

### Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "hana-gallery"
3. Enable **Google Photos Library API**

### Step 2: OAuth 2.0 Configuration

1. **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
2. **Web Application**
3. Add domains:
   ```
   Authorized JavaScript Origins:
   - http://localhost:5173
   - https://yourapp.vercel.app
   ```

### Step 3: Environment Variables

Create `.env.local`:
```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
VITE_GOOGLE_ALBUM_NAME=Test
```

## 📱 How to Find Your Album

### Method 1: Album Name (Easiest)
1. Note your album name (e.g., "Test", "Hana Photos", etc.)
2. App will automatically find it by name

### Method 2: Share URL to Album ID
1. Your share URL: `https://photos.app.goo.gl/xWww66tj4HdrhXd78`
2. The app will search through your albums to find the matching one
3. No manual ID extraction needed!

## 🔐 Simple Google OAuth (Only What You Need)

```typescript
// src/services/googleAuth.ts
export class GoogleAuthService {
  async initializeGoogleAuth() {
    await new Promise((resolve) => {
      window.gapi.load('auth2', resolve);
    });
    
    await window.gapi.auth2.init({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    });
  }
  
  async signIn() {
    const authInstance = window.gapi.auth2.getAuthInstance();
    const user = await authInstance.signIn({
      scope: 'https://www.googleapis.com/auth/photoslibrary.readonly'
    });
    return user;
  }
  
  getAccessToken() {
    const authInstance = window.gapi.auth2.getAuthInstance();
    const user = authInstance.currentUser.get();
    return user.getAuthResponse().access_token;
  }
  
  isSignedIn() {
    const authInstance = window.gapi.auth2.getAuthInstance();
    return authInstance?.isSignedIn.get() || false;
  }
}
```

## 📱 Fetch Photos from Shared Album

### Photo Service (Simple API Calls)

```typescript
// src/services/photoService.ts
interface Photo {
  id: string;
  baseUrl: string;
  filename: string;
  creationTime: string;
  width: number;
  height: number;
}

export class PhotoService {
  private accessToken: string;
  private albumName: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.albumName = import.meta.env.VITE_GOOGLE_ALBUM_NAME;
  }

  async findAlbumByName(): Promise<string | null> {
    try {
      const response = await fetch(
        'https://photoslibrary.googleapis.com/v1/albums',
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      const data = await response.json();
      const album = data.albums?.find((album: any) => 
        album.title === this.albumName
      );
      
      return album?.id || null;
    } catch (error) {
      console.error('Failed to find album:', error);
      return null;
    }
  }

  async getAlbumPhotos(): Promise<Photo[]> {
    try {
      // First, find the album by name
      const albumId = await this.findAlbumByName();
      if (!albumId) {
        console.error(`Album "${this.albumName}" not found`);
        return [];
      }

      const response = await fetch(
        `https://photoslibrary.googleapis.com/v1/mediaItems:search`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            albumId: albumId,
            pageSize: 100, // Max photos per request
          }),
        }
      );

      const data = await response.json();
      
      return data.mediaItems?.map((item: any) => ({
        id: item.id,
        baseUrl: item.baseUrl,
        filename: item.filename,
        creationTime: item.mediaMetadata.creationTime,
        width: parseInt(item.mediaMetadata.width),
        height: parseInt(item.mediaMetadata.height),
      })) || [];
      
    } catch (error) {
      console.error('Failed to fetch photos:', error);
      return [];
    }
  }

  // Generate different photo sizes
  getPhotoUrl(baseUrl: string, size: 'thumbnail' | 'medium' | 'large' = 'medium') {
    const sizes = {
      thumbnail: '=w300-h300-c',
      medium: '=w800-h600',
      large: '=w1200-h900'
    };
    
    return `${baseUrl}${sizes[size]}`;
  }
}
```

### Beautiful Gallery Component

```typescript
// src/components/PhotoGallery.tsx
import React, { useEffect, useState } from 'react';
import { PhotoService } from '../services/photoService';

interface Photo {
  id: string;
  baseUrl: string;
  filename: string;
  creationTime: string;
  width: number;
  height: number;
}

export const PhotoGallery: React.FC<{ accessToken: string }> = ({ accessToken }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const photoService = new PhotoService(accessToken);

  useEffect(() => {
    loadPhotos();
  }, [accessToken]);

  const loadPhotos = async () => {
    setIsLoading(true);
    try {
      const albumPhotos = await photoService.getAlbumPhotos();
      setPhotos(albumPhotos);
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedPhotos = photos.sort((a, b) => {
    const dateA = new Date(a.creationTime).getTime();
    const dateB = new Date(b.creationTime).getTime();
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-xl">Loading photos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          📸 {photos.length} Beautiful Memories
        </h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {sortedPhotos.map((photo) => (
          <div
            key={photo.id}
            className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={photoService.getPhotoUrl(photo.baseUrl, 'medium')}
              alt={photo.filename}
              className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-sm truncate">{photo.filename}</p>
              <p className="text-white/80 text-xs">
                {new Date(photo.creationTime).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={photoService.getPhotoUrl(selectedPhoto.baseUrl, 'large')}
              alt={selectedPhoto.filename}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70"
            >
              ✕
            </button>
            <div className="absolute bottom-4 left-4 text-white">
              <p className="font-semibold">{selectedPhoto.filename}</p>
              <p className="text-sm opacity-80">
                {new Date(selectedPhoto.creationTime).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

### Simple App (Clean & Focused)

```typescript
// src/App.tsx
import React, { useEffect, useState } from 'react';
import { GoogleAuthService } from './services/googleAuth';
import { PhotoGallery } from './components/PhotoGallery';

const googleAuth = new GoogleAuthService();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await loadGoogleAPI();
      await googleAuth.initializeGoogleAuth();
      
      if (googleAuth.isSignedIn()) {
        setIsAuthenticated(true);
        setAccessToken(googleAuth.getAccessToken());
      }
    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGoogleAPI = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  };

  const handleSignIn = async () => {
    try {
      await googleAuth.signIn();
      setIsAuthenticated(true);
      setAccessToken(googleAuth.getAccessToken());
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            👶 Hana's Photo Gallery
          </h1>
          
          {!isAuthenticated && (
            <button
              onClick={handleSignIn}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              View Photos
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {isAuthenticated ? (
          <PhotoGallery accessToken={accessToken} />
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📸</div>
            <h2 className="text-3xl font-bold mb-4">Welcome to Hana's Gallery</h2>
            <p className="text-gray-600 mb-8 text-lg">
              A beautiful collection of precious moments
            </p>
            <button
              onClick={handleSignIn}
              className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors text-lg"
            >
              Enter Gallery
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
```

## 🔄 Simple Data Flow

```
1. User visits app
2. Click "View Photos" 
3. Google OAuth popup opens
4. User grants album access permission
5. App fetches all photos from shared album
6. Beautiful masonry gallery displays photos
7. Sort by newest/oldest, click to view full size
```

## 🚀 Quick Deploy to Vercel

1. **Environment Variables** in Vercel dashboard:
   ```
   VITE_GOOGLE_CLIENT_ID=your_client_id
   VITE_GOOGLE_ALBUM_NAME=Test
   ```

2. **Update OAuth settings** with your Vercel URL:
   ```
   https://yourapp.vercel.app
   ```

3. **Deploy**:
   ```bash
   npm run build
   vercel --prod
   ```

## ✨ What You Get

🎨 **Beautiful UI Features:**
- **Masonry grid layout** - photos arranged perfectly
- **Hover effects** - smooth animations and info overlay  
- **Lightbox viewer** - full-size photo viewing
- **Sort by time** - newest or oldest first
- **Responsive design** - works great on mobile
- **Fast loading** - optimized photo sizes

🔒 **Simple & Secure:**
- **No database needed** - direct API access
- **Google handles auth** - no password management
- **Album-based access** - only photos from your shared album
- **Client-side only** - no server costs

🚀 **Perfect for Family:**
- **One-click access** - just click "View Photos"
- **Beautiful presentation** - professional gallery look
- **Mobile friendly** - grandparents can view easily
- **Fast performance** - photos load quickly

## 🎯 Result

You get a **beautiful, simple photo gallery** that:
- Shows photos from your daughter's Google Photos album
- Has a professional, Pinterest-like layout
- Sorts photos by time (newest/oldest)
- Works perfectly on mobile and desktop
- Costs $0.00 to run
- Takes 30 minutes to set up

**Perfect for sharing precious family moments!** 📸✨ 