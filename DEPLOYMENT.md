# GitHub Pages Deployment Guide - Medicine Within Website

> **Note**: This is a quick reference for GitHub Pages deployment. For a complete overview of all deployment options, see `README.md`.

## 🚀 Quick Start

Your website is now on GitHub and ready for GitHub Pages!

### Repository
- **GitHub URL**: https://github.com/Benji-cpu/medicine-within-website
- **Live Site URL**: https://benji-cpu.github.io/medicine-within-website/ (after enabling Pages)

## 📋 Enable GitHub Pages (One-Time Setup)

1. Go to: https://github.com/Benji-cpu/medicine-within-website/settings/pages
2. Under "Source", select:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
3. Click **Save**
4. Wait 1-2 minutes for deployment
5. Your site will be live at: **https://benji-cpu.github.io/medicine-within-website/**

## 🔄 How to Update the Website

Updates are simple - just push changes to GitHub:

```bash
cd "/Users/benhemson-struthers/Documents/Sandi - Medicine Within/build_1"

# Make your changes to files...

# Stage changes
git add .

# Commit with a message
git commit -m "Your update description"

# Push to GitHub
git push

# GitHub Pages automatically deploys in 1-2 minutes
```

## 📁 File Structure

All files are in the `build_1/` directory:
- `index.html` - Homepage
- `kambo.html` - Kambo page
- `temple.html` - Temple page
- `mentorship.html` - Mentorship page
- `retreats.html` - Retreats page
- `css/style.css` - Styles
- `js/` - JavaScript files
- `assets/` - Images and videos

## 🔒 Security Note

The file `js/config.js` (containing API keys) is excluded from git via `.gitignore` for security. If you need to deploy this file, you'll need to add it separately or use environment variables.

## 🎥 Large Video Files

The video files (`.mov` files in `assets/videos/`) are large (217MB total). They've been pushed to GitHub but may take time to load. For production, consider:
- Converting to optimized MP4 format
- Using a CDN or video hosting service (YouTube, Vimeo)
- Compressing videos before upload

## ✅ Current Status

- ✅ Git repository initialized
- ✅ Code pushed to GitHub
- ⏳ GitHub Pages needs to be enabled (see steps above)
- ✅ All file paths are relative and work with GitHub Pages

## 🆘 Troubleshooting

**Site not loading?**
- Check GitHub Pages is enabled in repository settings
- Wait 2-3 minutes after enabling for first deployment
- Check Actions tab for deployment status

**Changes not showing?**
- Wait 1-2 minutes after pushing (deployment takes time)
- Hard refresh browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Check GitHub Actions for deployment errors

**Need help?**
- GitHub Pages docs: https://docs.github.com/pages
- Repository: https://github.com/Benji-cpu/medicine-within-website

