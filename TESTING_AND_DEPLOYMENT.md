# Testing & Deployment Guide - Calendly Race Condition Fix

## Current Status

✅ **Local Code**: Fixed and ready  
❌ **Live Site**: Still using old code (needs deployment)

## What Was Fixed

1. **Script State Management**: Added `CalendlyLoader` module to properly track script loading
2. **Enhanced Ready Detection**: Waits for Calendly to be fully initialized, not just loaded
3. **Early Preloading**: Starts loading script in background on page load
4. **Improved Error Handling**: Better fallback behavior

## Testing the Fix Locally

Before deploying, test the fix locally:

### 1. Start Local Server
```bash
cd build_1
python3 -m http.server 8000
```

### 2. Open in Browser
Navigate to: `http://localhost:8000`

### 3. Test Checklist
- [ ] Open browser console (F12)
- [ ] Find "Book Discovery Call" button (floating button appears after scrolling)
- [ ] Click button **first time** - should open popup immediately (no errors)
- [ ] Check console for any Calendly errors
- [ ] Verify popup shows calendar (not error message)
- [ ] Close popup
- [ ] Click again - should still work immediately

### 4. Test on Different Pages
- [ ] Homepage (index.html) - floating button
- [ ] Kambo page - multiple booking links
- [ ] Mentorship page - booking links
- [ ] Test with slow network (Chrome DevTools > Network > Slow 3G)

## Deployment Steps

### Important: config.js Issue

The live site shows a 404 error for `config.js`. This is expected if `config.js` is in `.gitignore`, but it means:
- The site needs `config.js` to work properly
- Or the code needs a better fallback for missing config

### Option 1: Deploy with config.js (Recommended for testing)

1. **Temporarily allow config.js** (for testing):
   ```bash
   # Remove config.js from .gitignore temporarily
   # Or copy it to a different location that's not ignored
   ```

2. **Commit and push**:
   ```bash
   cd build_1
   git add js/main.js js/config.js
   git commit -m "Fix Calendly race condition - improve script loading"
   git push
   ```

3. **Wait for GitHub Pages** to rebuild (usually 1-2 minutes)

### Option 2: Improve Fallback (Better for production)

The code already has a fallback URL, but we should ensure it works even without config.js.

## Current Live Site Status

From browser testing:
- ✅ Calendly script loads
- ✅ `openCalendlyPopup` function exists (old version)
- ❌ `config.js` returns 404
- ❌ `CalendlyLoader` doesn't exist (new code not deployed)

## Expected Behavior After Deployment

### Before Fix (Current):
- First click: Error or calendar unavailable
- Second click: Works

### After Fix (After Deployment):
- First click: Works immediately ✅
- All subsequent clicks: Work immediately ✅
- Script preloads in background
- Better error handling

## Verification After Deployment

1. **Clear browser cache** (important!)
2. Visit: `https://benji-cpu.github.io/medicine-within-website/`
3. Open browser console (F12)
4. Check console for:
   - No Calendly errors
   - `CalendlyLoader` exists (check: `typeof CalendlyLoader`)
5. Test first click on booking button
6. Should open popup immediately without errors

## Troubleshooting

### If config.js is missing:
The code has a fallback URL hardcoded, but it's better to have config.js. Check:
- Is `config.js` in `.gitignore`?
- Does it need to be committed for GitHub Pages?
- Should we use environment variables instead?

### If fix doesn't work after deployment:
1. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. Check browser console for errors
3. Verify `CalendlyLoader` exists: `typeof CalendlyLoader !== 'undefined'`
4. Check script loading order in Network tab

## Next Steps

1. **Test locally first** using the steps above
2. **Deploy to GitHub Pages** once local testing passes
3. **Verify on live site** after deployment
4. **Monitor for any issues**


