import { create } from 'zustand';
import { Photo } from '../types';

interface PhotoStore {
  photos: Photo[];
  isLoading: boolean;
  isSignedIn: boolean;
  error: string | null;
  sortOrder: 'newest' | 'oldest';
  
  // Actions
  setPhotos: (photos: Photo[]) => void;
  setLoading: (loading: boolean) => void;
  setSignedIn: (signedIn: boolean) => void;
  setError: (error: string | null) => void;
  setSortOrder: (order: 'newest' | 'oldest') => void;
  getSortedPhotos: () => Photo[];
  clearError: () => void;
}

export const usePhotoStore = create<PhotoStore>((set, get) => ({
  photos: [],
  isLoading: false,
  isSignedIn: false,
  error: null,
  sortOrder: 'newest',
  
  setPhotos: (photos) => set({ photos }),
  setLoading: (isLoading) => set({ isLoading }),
  setSignedIn: (isSignedIn) => set({ isSignedIn }),
  setError: (error) => set({ error }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  clearError: () => set({ error: null }),
  
  getSortedPhotos: () => {
    const { photos, sortOrder } = get();
    const sorted = [...photos].sort((a, b) => {
      const dateA = new Date(a.creationTime).getTime();
      const dateB = new Date(b.creationTime).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  },
})); 