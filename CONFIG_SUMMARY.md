# Configuration Summary - Ready for WordPress Migration

## ✅ All Configuration Data Complete

This document summarizes all configuration data that has been set up and tested for the Medicine Within website.

---

## 🔑 ConvertKit Configuration

### API Keys
- **API v3 (Public Key)**: `eludDXTW2eHbUSOm5ORwEQ`
  - Safe for frontend use
  - Used for tag-based subscriptions
  
- **API v4**: `kit_b6f0dc48d67c518540c80d9f22aef2dc`
  - Reserved for future use
  
- **API Base URL**: `https://api.convertkit.com/v3`

### Form IDs (Legacy - for reference/backward compatibility)
| Page | Form ID | Description |
|------|---------|-------------|
| Homepage | `8824122` | "Join the Circle" |
| Temple | `8824140` | "Get Early Access" |
| Retreats | `8824150` | "Join Waitlist" |
| Kambo | `8824159` | "Get Updates" |

### Tag IDs (Active - for tag-based subscriptions) ✅ TESTED
| Page | Tag ID | Tag Name | Status |
|------|--------|----------|--------|
| Homepage | `13000746` | `interest-general` | ✅ Working |
| Temple | `13000747` | `interest-temple` | ✅ Working |
| Retreats | `13000748` | `interest-retreats` | ✅ Working |
| Kambo | `13000749` | `interest-kambo` | ✅ Working |

**All tags have been tested and verified working via API.**

---

## 🎫 Hipsy Configuration

- **API Key**: `17173|iviQqmIxb5h95iTC9B9h352bYf3sHr60FxlWwqiF0e025d3e`
- **API Endpoint**: `https://api.hipsy.nl/v1/events`
- **Profile URL**: `https://www.hipsy.nl/organisator/medicine-within`

---

## 📁 Files Ready for Migration

### Core Files
- ✅ `js/config.js` - Complete configuration with all keys and IDs
- ✅ `js/main.js` - ConvertKitManager with tag subscription support
- ✅ `css/style.css` - Form styling included

### Test/Verification Files
- ✅ `test-tag-subscriptions.html` - Interactive test page
- ✅ `js/test-tag-api.js` - Browser console test script
- ✅ `js/verify-config.html` - Configuration verification page
- ✅ `TAG_TESTING_RESULTS.md` - Test results documentation

### Documentation
- ✅ `WORDPRESS_MIGRATION_GUIDE.md` - Complete WordPress migration instructions
- ✅ `CONFIG_SUMMARY.md` - This file

---

## 🎯 Customer Journey Mapping

### Homepage → General Newsletter
- **Tag**: `interest-general` (ID: `13000746`)
- **Form Tag Attribute**: `data-ck-tags="13000746"`
- **Use Case**: General newsletter subscribers
- **Email Sequence**: Welcome series, general updates, all offerings

### Temple Page → Temple Interest
- **Tag**: `interest-temple` (ID: `13000747`)
- **Form Tag Attribute**: `data-ck-tags="13000747"`
- **Use Case**: People interested in Temple events
- **Email Sequence**: Temple event announcements, early access to tickets

### Retreats Page → Retreats Waitlist
- **Tag**: `interest-retreats` (ID: `13000748`)
- **Form Tag Attribute**: `data-ck-tags="13000748"`
- **Use Case**: People on retreat waitlist
- **Email Sequence**: Retreat announcements, early bird pricing, application links

### Kambo Page → Kambo Interest
- **Tag**: `interest-kambo` (ID: `13000749`)
- **Form Tag Attribute**: `data-ck-tags="13000749"`
- **Use Case**: People interested in Kambo ceremonies
- **Email Sequence**: Kambo education, ceremony dates, safety information

---

## 🔧 Implementation Status

### ✅ Completed
- [x] All ConvertKit tag IDs retrieved and verified
- [x] Tag IDs added to `config.js`
- [x] All four tags tested via API
- [x] Subscribers created successfully with correct tags
- [x] JavaScript code ready in `main.js`
- [x] Form styling ready in `css/style.css`
- [x] Test tools created
- [x] Documentation complete

### ⚠️ Pending (For WordPress Migration)
- [ ] Upload files to WordPress theme
- [ ] Enqueue scripts in WordPress
- [ ] Replace native ConvertKit embeds with tag-based forms
- [ ] Test forms on WordPress site
- [ ] Set up email sequences in ConvertKit
- [ ] Configure automations in ConvertKit

---

## 🧪 Testing Verification

All tags have been tested and verified:

| Test | Result |
|------|--------|
| Tag API connectivity | ✅ Working |
| Homepage tag subscription | ✅ Working |
| Temple tag subscription | ✅ Working |
| Retreats tag subscription | ✅ Working |
| Kambo tag subscription | ✅ Working |
| Subscriber creation | ✅ Working |
| Tag assignment | ✅ Working |

**Test Subscriber IDs Created:**
- General: 3758000687
- Temple: 3758000695
- Retreats: 3758000701
- Kambo: 3758000710

---

## 📝 Quick Reference

### Form HTML Template
```html
<form data-ck-tags="[TAG_ID]" class="newsletter-form">
    <input type="email" name="email" placeholder="Enter your email" required>
    <button type="submit">Subscribe</button>
</form>
```

### Tag ID Reference
- Homepage: `13000746`
- Temple: `13000747`
- Retreats: `13000748`
- Kambo: `13000749`

### JavaScript Access
```javascript
// Access config
window.MEDICINE_WITHIN_CONFIG.convertKit.tags.general
window.MEDICINE_WITHIN_CONFIG.convertKit.tags.temple
window.MEDICINE_WITHIN_CONFIG.convertKit.tags.retreats
window.MEDICINE_WITHIN_CONFIG.convertKit.tags.kambo
```

---

## ✅ Ready for WordPress Migration

All configuration data is complete, tested, and documented. The site is ready to be migrated to WordPress with full ConvertKit tag-based subscription functionality.

See `WORDPRESS_MIGRATION_GUIDE.md` for detailed migration instructions.



