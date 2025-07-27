# Windows 10 Setup Guide - Hana Gallery

## Step 1: Install Node.js 18+ (Required)

### Direct Download (Easiest)
1. **Go to**: https://nodejs.org/en/download/
2. **Download**: Windows Installer (.msi) - LTS version 18+
3. **Run installer**: Accept all defaults
4. **Restart PowerShell**: Close and reopen terminal

### Verify Installation
```powershell
node --version  # Should show v18+ or v20+
npm --version   # Should show v9+ or v10+
```

## Step 2: Create Hana Gallery Project

**Run these commands after Node.js 18+ is installed:**

```powershell
# Navigate to workspace
cd D:\FPT_Projects\Haha_web

# Create React + TypeScript project
npm create vite@latest hana-gallery -- --template react-ts

# Navigate to project
cd hana-gallery

# Install dependencies
npm install

# Install gallery-specific packages
npm install @tanstack/react-query zustand lucide-react

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install development tools
npm install -D @types/node @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks prettier eslint-config-prettier

# Start development server
npm run dev
```

## Step 3: Connect to GitHub

```powershell
# Inside hana-gallery directory
git init
git add .
git commit -m "Initial commit: React + Vite + TypeScript setup"
git branch -M main
git remote add origin https://github.com/Nouking/hana-gallery.git
git push -u origin main
```

## Expected Result
- **Browser opens**: http://localhost:5173
- **Shows**: Vite + React welcome page
- **Ready for**: SETUP-002 (Tailwind configuration)

## If You Get Errors
- **PowerShell execution policy**: Run as Administrator → `Set-ExecutionPolicy RemoteSigned`
- **Port in use**: Use `npm run dev -- --port 3000`
- **Git not found**: Install Git from https://git-scm.com/download/win 