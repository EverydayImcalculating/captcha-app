# Captcha Test Web App

A user experience evaluation tool for different types of captcha tests, built with Next.js and featuring a minimal pastel cute design.

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher (or yarn/pnpm)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd captcha-app
```

### 2. Install Dependencies

```bash
npm install
```

#### Troubleshooting Installation Issues

**Problem: npm tries to use a custom registry (Azure DevOps, Artifactory, etc.)**

If you see an error like:
```
npm ERR! 404 Not Found - GET https://pkgs.dev.azure.com/...
```

**Solution:** Reset npm to use the default public registry:

```bash
# Clear npm registry configuration
npm config delete registry

# OR explicitly set to public npm registry
npm config set registry https://registry.npmjs.org/

# Then try installing again
npm install
```

**Problem: EPERM errors on Windows**

If you see `EPERM: operation not permitted` errors:

1. Close all terminal windows and editors
2. Delete `node_modules` folder manually
3. Run as Administrator:
   ```bash
   npm install
   ```

**Problem: Package version conflicts**

If installation fails, try:

**On macOS/Linux:**
```bash
# Clear npm cache
npm cache clean --force

# Remove lock file and node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

**On Windows (PowerShell):**
```powershell
# Clear npm cache
npm cache clean --force

# Remove lock file and node_modules
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Reinstall
npm install
```

**On Windows (Command Prompt):**
```cmd
# Clear npm cache
npm cache clean --force

# Remove lock file and node_modules
rmdir /s /q node_modules
del package-lock.json

# Reinstall
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Project Overview

This application evaluates user experience across three captcha types:
- **Image Captcha** - Select target images from a 3x3 grid
- **Text Captcha** - Type distorted text from a canvas
- **Slider Captcha** - Slide a puzzle piece to match position

### Test Flow
- 15 total rounds (5 per captcha type)
- Progressive difficulty levels
- 3 frustration ratings (one per captcha type)
- Detailed analytics and CSV export

## 📦 Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand 5.0.11
- **UI Components:** Custom components with shadcn/ui patterns
- **Font:** Nunito (Google Fonts)

## 🛠️ Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📁 Project Structure

```
captcha-app/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── captcha/      # Captcha test components
│   │   └── ui/           # Reusable UI components
│   └── lib/              # Utilities and store
├── public/               # Static assets
└── ...config files
```

## 🎯 Features

- ✅ Responsive design with minimal pastel aesthetic
- ✅ Type-based frustration ratings (improved UX)
- ✅ Auto-submit slider captcha
- ✅ Raw data table with CSV export
- ✅ Progressive difficulty system
- ✅ Detailed performance analytics

## 📄 License

This project is for educational/research purposes.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
