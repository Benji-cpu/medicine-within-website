# Calendly Race Condition Fix - Implementation Summary

## Problem
The Calendly popup showed an error on first click but worked on second click. This was caused by a **script loading race condition** where the async Calendly script wasn't fully initialized when the popup was triggered.

## Solution Implemented

### 1. Script State Management System
Created a robust `CalendlyLoader` module that:
- Tracks script loading state: `unknown`, `loading`, `loaded`, `ready`, `failed`
- Uses Promise-based loading for proper async handling
- Detects when Calendly is FULLY ready (not just loaded, but initialized)
- Handles existing script tags in DOM or loads dynamically if needed

### 2. Enhanced Ready Detection
Replaced simple `typeof` check with comprehensive detection:
- Checks if `Calendly` object exists
- Verifies `initPopupWidget` is a function
- Validates function signature (length check)
- Waits up to 10 seconds for initialization

### 3. Early Script Preloading
Added automatic preloading when DOM is ready:
- Starts loading Calendly script in background immediately
- Doesn't block page load (async)
- Ensures script is ready faster when user clicks
- Falls back gracefully if preload fails

### 4. Improved Error Handling
- Proper Promise-based error handling
- Graceful fallback to direct link if script fails
- Clear console warnings for debugging
- Pop-up blocker detection

## Technical Changes

### Files Modified

**`build_1/js/main.js`**
- Added `CalendlyLoader` module at top level (before DOMContentLoaded)
- Enhanced `openCalendlyPopup()` function with Promise-based loading
- Added early script preloading on DOM ready
- Improved error handling and fallback logic

### Key Features

1. **Script Detection**:
   - Detects existing script tags in DOM
   - Waits for script load events properly
   - Handles cases where script is already loaded

2. **Ready State Verification**:
   - Waits for Calendly to be fully initialized
   - Not just loaded, but ready to use
   - Validates function availability

3. **Race Condition Prevention**:
   - Uses Promise-based state management
   - Prevents multiple simultaneous load attempts
   - Queues callbacks if script is still loading

4. **Performance Optimization**:
   - Preloads script early for faster first click
   - Doesn't block initial page load
   - Caches loaded state to prevent redundant checks

## How It Works Now

1. **Page Load**:
   - CalendlyLoader module initializes
   - Script preloading starts automatically when DOM is ready
   - Script loads in background

2. **First Click**:
   - Function checks if Calendly is ready
   - If ready: Opens popup immediately ✅
   - If loading: Waits for script to finish, then opens
   - If failed: Falls back to direct link

3. **Subsequent Clicks**:
   - Script is already loaded and ready
   - Opens popup immediately every time ✅

## Testing Checklist

- [x] First click works immediately (no errors)
- [x] Script preloads on page load
- [x] Handles slow network connections
- [x] Falls back gracefully if script fails
- [x] Works on all pages (index, kambo, mentorship, temple, retreats)
- [x] No console errors on first click

## Configuration

The Calendly URL is configured in `build_1/js/config.js`:
```javascript
calendly: {
    discovery: 'https://calendly.com/joulfayansandy/discovery-call-30-minutes'
}
```

**Note**: Make sure the calendar is set to "Public" in your Calendly account settings.

## Browser Compatibility

Works in all modern browsers with proper fallback support:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers

## Performance Impact

- **Minimal**: Script preloading is async and non-blocking
- **Faster**: First click is now instant if script loaded early
- **Efficient**: State caching prevents redundant checks

## Summary

The race condition has been completely resolved. The Calendly popup now works reliably on the first click by:
1. Properly detecting script loading state
2. Waiting for full initialization before opening
3. Preloading script early for faster response
4. Gracefully handling all error cases


