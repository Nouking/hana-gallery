export interface Photo {
  id: string;
  filename: string;
  mimeType: string;
  creationTime: string;
  baseUrl: string;
  description?: string;
  mediaMetadata: {
    width: string;
    height: string;
  };
}

export interface Album {
  id: string;
  title: string;
  shareUrl: string;
  mediaItemsCount: string;
} 