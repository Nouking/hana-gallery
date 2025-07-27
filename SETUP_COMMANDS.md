# Setup Commands for Hana Gallery (Windows 10)

## Step 1: Upgrade Node.js (Required)

**Current**: Node.js v14.17.1  
**Required**: Node.js 18+

### Option A: Direct Download (Recommended)
1. Download Node.js 18+ from https://nodejs.org
2. Install the Windows installer (.msi)
3. Restart PowerShell/terminal

### Option B: Using Chocolatey (if installed)
```powershell
choco install nodejs --version=18.19.0
```

## Step 2: Create Project (After Node.js 18+)

```powershell
# 1. Create React + TypeScript project
npm create vite@latest hana-gallery -- --template react-ts

# 2. Navigate to project (Windows PowerShell)
cd hana-gallery

# 3. Install dependencies
npm install

# 4. Install additional dependencies for gallery
npm install @tanstack/react-query zustand lucide-react

# 5. Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 6. Install dev dependencies
npm install -D @types/node @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks prettier eslint-config-prettier

# 7. Initialize git and connect to GitHub
git init
git add .
git commit -m "Initial commit: React + Vite + TypeScript setup"
git branch -M main
git remote add origin https://github.com/Nouking/hana-gallery.git
git push -u origin main

# 8. Start development server
npm run dev
```

## Verification Commands:
```powershell
# Check versions
node --version    # Should be 18+
npm --version     # Should be 9+
git --version     # Should work
```

## Next Steps After Setup:
1. Confirm http://localhost:5173 shows Vite + React page
2. Ready for SETUP-002: Tailwind CSS configuration 