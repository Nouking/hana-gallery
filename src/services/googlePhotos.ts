import { gapi } from 'gapi-script';
import { Photo, Album } from '../types';

class GooglePhotosService {
  private isInitialized = false;
  private isSignedIn = false;
  
  async initialize() {
    if (this.isInitialized) return;
    
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
    
    if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
      throw new Error('Google API credentials not found. Please check your .env.local file.');
    }
    
    await gapi.load('auth2', () => {
      gapi.auth2.init({
        client_id: GOOGLE_CLIENT_ID,
      });
    });
    
    await gapi.load('client', async () => {
      await gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        discoveryDocs: ['https://photoslibrary.googleapis.com/$discovery/rest?version=v1'],
      });
    });
    
    this.isInitialized = true;
  }
  
  async signIn(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const authInstance = gapi.auth2.getAuthInstance();
    
    if (authInstance.isSignedIn.get()) {
      this.isSignedIn = true;
      return true;
    }
    
    try {
      await authInstance.signIn({
        scope: 'https://www.googleapis.com/auth/photoslibrary.readonly'
      });
      this.isSignedIn = true;
      return true;
    } catch (error) {
      console.error('Sign in failed:', error);
      throw new Error('Google sign-in failed. Please try again.');
    }
  }
  
  async getAlbums(): Promise<Album[]> {
    if (!this.isSignedIn) {
      throw new Error('Not signed in. Please sign in first.');
    }
    
    try {
      const response = await gapi.client.request({
        path: 'https://photoslibrary.googleapis.com/v1/albums',
        method: 'GET',
      });
      
      return response.result.albums || [];
    } catch (error) {
      console.error('Failed to fetch albums:', error);
      throw new Error('Failed to fetch albums from Google Photos.');
    }
  }
  
  async findAlbumByName(albumName: string): Promise<string | null> {
    const albums = await this.getAlbums();
    const targetAlbum = albums.find(album => 
      album.title.toLowerCase().includes(albumName.toLowerCase())
    );
    return targetAlbum?.id || null;
  }
  
  async getAlbumPhotos(albumId: string): Promise<Photo[]> {
    if (!this.isSignedIn) {
      throw new Error('Not signed in. Please sign in first.');
    }
    
    try {
      const response = await gapi.client.request({
        path: 'https://photoslibrary.googleapis.com/v1/mediaItems:search',
        method: 'POST',
        body: {
          albumId: albumId,
          pageSize: 100
        }
      });
      
      return response.result.mediaItems || [];
    } catch (error) {
      console.error('Failed to fetch album photos:', error);
      throw new Error('Failed to fetch photos from the album.');
    }
  }
  
  async getTestAlbumPhotos(): Promise<Photo[]> {
    // Try to find the "Test" album mentioned in the shared URL
    const albumId = await this.findAlbumByName('Test');
    
    if (!albumId) {
      throw new Error('Test album not found. Make sure you have access to the shared album.');
    }
    
    return this.getAlbumPhotos(albumId);
  }
  
  getOptimizedImageUrl(baseUrl: string, width: number, height: number): string {
    return `${baseUrl}=w${width}-h${height}-c`;
  }
  
  signOut() {
    if (this.isInitialized) {
      gapi.auth2.getAuthInstance().signOut();
      this.isSignedIn = false;
    }
  }
}

export const googlePhotosService = new GooglePhotosService(); 