# 🚀 GitHub Pages + Netlify Functions Deployment Guide

## 📋 **Overview**
This setup uses:
- **GitHub Pages**: Free hosting for frontend (HTML, CSS, JS)
- **Netlify Functions**: Free serverless backend for Google Drive API
- **Total Cost**: $0 (100% Free)

## 🎯 **Step 1: Deploy Frontend to GitHub Pages**

### 1.1 Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Create a new repository named `photo-upload-website`
3. Make it **Public** (required for free GitHub Pages)

### 1.2 Upload Frontend Files
Upload these files to your GitHub repository:
- ✅ `index.html`
- ✅ `mmec.html`
- ✅ `slu.html`
- ✅ `mmec.js`
- ✅ `slu.js`
- ✅ `script.js`
- ✅ `styles.css`

### 1.3 Enable GitHub Pages
1. Go to your repository **Settings**
2. Scroll down to **Pages** section
3. Under **Source**, select **Deploy from a branch**
4. Select **main** branch and **/(root)** folder
5. Click **Save**
6. Your site will be live at: `https://yourusername.github.io/photo-upload-website`

## 🌐 **Step 2: Deploy Backend to Netlify Functions**

### 2.1 Create Netlify Account
1. Go to [Netlify.com](https://netlify.com)
2. Sign up with your GitHub account
3. Click **New site from Git**

### 2.2 Deploy Functions
1. **Connect to GitHub** and select your repository
2. **Build settings**:
   - Build command: `npm install`
   - Publish directory: `.`
3. **Click Deploy site**

### 2.3 Add Environment Variables
1. Go to **Site settings** → **Environment variables**
2. Add these variables from your `stationamenity-89e9bc13e1cc.json`:

```
PRIVATE_KEY_ID=89e9bc13e1ccfc971205761e70b6e490dc5f566d
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCKVf048rh0Rhvj\n9EF6fkoaBZOV7VRRHIpl9vIgh3kWPYX/oZs9q9Q+1nDv1JBS1PUFw0i+n6CV/Vto\nLIPtyRsPEjXpXugupB1c0HmhzgXrPJW+q7dfcjcm2r0WzJBsPfKIikWl3z8Eo/VU\n2X8suqX0pVNWV+FOtl2lSVjYCoFPSYzFNKULIMMpZJLTOB6ya9mEg4SGpRorPMfD\nghnYes7DDBo3NSY3p3zdgJemIS2jIE3zUG3dfJWQ1E2+VvJ0xiVSTztvr/2kw/bm\nzZ66YTS0AG9Wk4MNjfucuEhikKraPqp2v0S7kPM7Lj8n4XoLb2Rc4tWZ9Ry/BYiV\n4NU/DzBJAgMBAAECggEABt2KoitlnRunobILF92xpsX1E6FCKH5enf3Z+WRPzZtD\nDbNDBZYEBBRXaYemm/3GpUESWKeKbDc1NJ/U8lWjOqXAODNGGZ56eJM+Hhof8BND\nKUHTaXC9LPf5H2sKldyjL0SRfVBti7jpYYsjxSAEQXZ9AtF8tI/XaO8RcjNfRISC\nwohJkQqYXfxWnbWj8Z9DqPjdJ6GxE5DlQXCOhvtJPuGb7jpdUPKbrNEvpG51A/5x\nz+SHzbDtRECrBohjPNyDplOUFx9glbC1LWvJ6tgxq+MxMdaFZACiK+5gU+EOXms1\nhkArVZ280ckPfYbc4M4hTseebhbK7Ans2rHTdFJMSQKBgQC9g02la/eNA4NHi0Cc\nV/OT32KIPUaP11T1Dodo0h8VsR9Ud60gSZ9tM6QaaWXSu5xr4Eb5RMQWNanIoSoO\nk0juVEnBkxhhsA5eWTQ5qC2qehwb5E80F0+xfNW4iQViDKX/t7oKs0yjsBelj++P\ntqxy89fkotKbBtM9gkYrSHnfbQKBgQC63lUGha+dIcViQqJBb/ryE8CEnEL51nI0\n/NrlUuC5BHol51Wve6x5VfgARycmmzXRwU9zjlAiEnvX8GWeKighPeo1w0o45Ux9\nqfnxmE/pxaZgMd27qB+AMTyLgC30ql468ZNUGgyhH4DBnCreWqn7xIIM4/21pCNE\nsRYHLpqezQKBgATpuYKXWPST6bxaFNO4x/zGZsSHaiPifjZYKRSDlgC29cv3ykoy\n/moTU6bHorci2/xD9TMTIE4/F+a2nuN/1/0tvDfDe3dU3BqAD4WLIZvwzHfApHkC\nPbOpO9Ur4DLZhxgpCC6s1UjNEN/e6mP8ZV4ZijhILFOOir1mejE3EMnFAoGAT+Z8\nyHsk6bTk5uzC3+P3ksZrTMhbwuO0lX+AQQm82J9XcxmFA7GHv6HIlqXV0aYPzw4u\n4KP7E3Z/yYcajBROcFg+6poEBGvW1ux02J5dnQFL8FmiC3kJbxCeaK939uNZwy5D\n5nP07ne/4AjcM5Lkl6ggS064zo/OHLLzTkLZDgkCgYEAq1CJkk2nnsVHH5u+aOwY\n1bZr7WXCJeFoJpTPKSlz/HrWMejrMRh3KAx3FwVA6VdB6ozh+tcdOWmmS+rCxOCc\n6E42VICz8gDRb1B261kwFZQTmsT4XlLBSrCN7y8lTUi86z8Cr5ymbQsPzXzOjlhW\n4I+CwX6F1b2aNtGSKD32Jd8=\n-----END PRIVATE KEY-----\n"
CLIENT_EMAIL=photosupload@stationamenity.iam.gserviceaccount.com
CLIENT_ID=103058137868523833125
CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/photosupload%40stationamenity.iam.gserviceaccount.com
```

## 🔗 **Step 3: Connect Frontend to Backend**

### 3.1 Update JavaScript Files
The JavaScript files are already updated to use Netlify functions:
- `mmec.js` and `slu.js` use `/.netlify/functions/upload`
- No changes needed

### 3.2 Test the Connection
1. Your GitHub Pages site: `https://yourusername.github.io/photo-upload-website`
2. Backend functions: `https://your-netlify-site.netlify.app/.netlify/functions/upload`

## 📱 **Step 4: Test Mobile Functionality**

1. **Open** your GitHub Pages URL on mobile
2. **Click** MMEC or SLU
3. **Select photos** (should work now)
4. **Upload** to Google Drive

## ✅ **What You Get**

- 🌐 **Frontend**: `https://yourusername.github.io/photo-upload-website`
- 🔧 **Backend**: Netlify Functions (serverless)
- 💰 **Cost**: $0 (completely free)
- 📱 **Mobile**: Fully functional
- 🔒 **Security**: Environment variables for credentials

## 🎉 **Success!**

Your photo upload website is now:
- ✅ Hosted for free on GitHub Pages
- ✅ Backend handled by free Netlify Functions
- ✅ Mobile-friendly with photo selection
- ✅ Uploads directly to Google Drive
- ✅ No monthly costs or limits

**Start with Step 1 and let me know when you're ready for the next step!** 🚀 