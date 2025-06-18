@echo off
echo 🚀 GitHub Pages + Netlify Functions Deployment Helper
echo ====================================================
echo.
echo 📋 This will deploy your photo upload website for FREE!
echo.
echo 🎯 STEP 1: GitHub Pages (Frontend)
echo -----------------------------------
echo 1. Go to https://github.com
echo 2. Create new repository: photo-upload-website
echo 3. Make it PUBLIC (required for free GitHub Pages)
echo 4. Upload these files:
echo    - index.html
echo    - mmec.html
echo    - slu.html
echo    - mmec.js
echo    - slu.js
echo    - script.js
echo    - styles.css
echo    - netlify.toml
echo    - functions/upload.js
echo    - functions/package.json
echo.
echo 5. Go to Settings > Pages
echo 6. Source: Deploy from a branch
echo 7. Branch: main, Folder: /(root)
echo 8. Save
echo.
echo 🌐 STEP 2: Netlify Functions (Backend)
echo --------------------------------------
echo 1. Go to https://netlify.com
echo 2. Sign up with GitHub
echo 3. New site from Git
echo 4. Connect your repository
echo 5. Build settings:
echo    - Build command: npm install
echo    - Publish directory: .
echo 6. Deploy site
echo.
echo 🔧 STEP 3: Environment Variables
echo --------------------------------
echo 1. Go to Site settings > Environment variables
echo 2. Add the variables from GITHUB_PAGES_DEPLOYMENT.md
echo.
echo 📱 STEP 4: Test
echo ---------------
echo 1. Open your GitHub Pages URL on mobile
echo 2. Test photo selection and upload
echo.
echo 💰 RESULT: 100%% FREE HOSTING!
echo.
pause 