# 🚀 Hana Gallery - Local Test Setup

This is a test implementation of the photo gallery that can fetch photos from the Google Photos shared album.

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Google Cloud Console Account** (free)
3. **Access to the Test Album** (https://photos.app.goo.gl/xWww66tj4HdrhXd78)

## ⚙️ Setup Steps

### 1. Install Dependencies

```bash
cd hana-gallery
npm install
```

### 2. Create Google API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the **Google Photos Library API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Photos Library API"
   - Click "Enable"

4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API Key
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized origins:
     - `http://localhost:5173`
     - `http://localhost:3000`
   - Copy the Client ID

### 3. Configure Environment Variables

Create a `.env.local` file in the `hana-gallery` directory:

```bash
# Copy the example file
cp .env.example .env.local
```

Edit `.env.local` and replace with your actual credentials:

```env
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id_here
VITE_GOOGLE_API_KEY=your_actual_google_api_key_here
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🧪 Testing the Gallery

### Option 1: Full Authentication Flow
1. Click "Sign In" button
2. Authenticate with your Google account
3. Click "Sync Photos" to fetch from the Test album
4. View the beautiful masonry gallery!

### Option 2: Load Cached Photos (if previously synced)
1. Click "Load Cached" to load previously synced photos
2. No authentication needed for viewing

## ✨ Gallery Features

- **Masonry Layout**: Pinterest-style responsive grid
- **Time Sorting**: Toggle between newest/oldest first
- **Lightbox Viewer**: Click photos for full-size view
- **Photo Download**: Download original photos
- **Mobile Responsive**: Works perfectly on phones/tablets
- **Hover Effects**: Beautiful animations and photo info overlay

## 🔧 Troubleshooting

### "Google API credentials not found" Error
- Make sure `.env.local` file exists with correct credentials
- Restart the dev server after creating/editing `.env.local`

### "Test album not found" Error
- Ensure you have access to the shared album
- The album name should contain "Test" (case insensitive)
- Try creating your own album named "Test" for testing

### CORS Errors
- Make sure your domain is added to authorized origins in Google Cloud Console
- For localhost, use `http://localhost:5173` (not https)

### No Photos Showing
- Check browser console for errors
- Verify Google Photos Library API is enabled
- Make sure you're signed in to the Google account that has access to the album

## 📱 Project Structure

```
hana-gallery/
├── src/
│   ├── components/
│   │   ├── GalleryHeader.tsx    # Authentication & controls
│   │   └── PhotoGallery.tsx     # Masonry gallery & lightbox
│   ├── services/
│   │   └── googlePhotos.ts      # Google Photos API integration
│   ├── store/
│   │   └── photoStore.ts        # Zustand state management
│   └── App.tsx                  # Main app component
├── .env.example                 # Environment variables template
└── package.json                 # Dependencies & scripts
```

## 🎯 Next Steps

Once you confirm the local test works:
1. Deploy to Vercel for free hosting
2. Configure production environment variables
3. Add custom domain (optional)
4. Share the public gallery URL with family/friends!

---

**🎉 Enjoy your beautiful photo gallery!** 📸✨ 