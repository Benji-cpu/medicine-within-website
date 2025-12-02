# ConvertKit Tag Subscription Testing Results

## ✅ Test Results - All Tags Working

All four customer journey tags have been successfully tested and verified:

| Journey | Tag Name | Tag ID | Status | Test Subscriber ID |
|---------|----------|--------|--------|-------------------|
| **Homepage** | `interest-general` | `13000746` | ✅ Working | 3758000687 |
| **Temple** | `interest-temple` | `13000747` | ✅ Working | 3758000695 |
| **Retreats** | `interest-retreats` | `13000748` | ✅ Working | 3758000701 |
| **Kambo** | `interest-kambo` | `13000749` | ✅ Working | 3758000710 |

## 🧪 How to Test

### Option 1: Use Test Page
Open `test-tag-subscriptions.html` in your browser to test each journey interactively.

### Option 2: Use Browser Console
1. Open any page that loads `config.js` and `main.js`
2. Load `js/test-tag-api.js` script
3. Run: `testAllTags()`

### Option 3: Test Individual Tags
```javascript
// In browser console
testTagSubscription('13000746', 'interest-general', 'your-email@example.com')
```

## 📋 Verification Steps

### 1. Check ConvertKit Dashboard
1. Log into ConvertKit
2. Go to **Subscribers** → **Tags**
3. Click on each tag to see subscribers
4. Verify test subscribers appear with correct tags

### 2. Verify Tag Assignment
1. Go to **Subscribers** → **All Subscribers**
2. Search for test emails (e.g., `test-interest-general-*`)
3. Click on a subscriber
4. Check the **Tags** section - should show the correct tag

## 🎯 Customer Journey Mapping

### Homepage → General Newsletter
- **Tag**: `interest-general` (ID: `13000746`)
- **Use Case**: General newsletter subscribers
- **Email Sequence**: Welcome series, general updates, all offerings

### Temple Page → Temple Interest
- **Tag**: `interest-temple` (ID: `13000747`)
- **Use Case**: People interested in Temple events
- **Email Sequence**: Temple event announcements, early access to tickets

### Retreats Page → Retreats Waitlist
- **Tag**: `interest-retreats` (ID: `13000748`)
- **Use Case**: People on retreat waitlist
- **Email Sequence**: Retreat announcements, early bird pricing, application links

### Kambo Page → Kambo Interest
- **Tag**: `interest-kambo` (ID: `13000749`)
- **Use Case**: People interested in Kambo ceremonies
- **Email Sequence**: Kambo education, ceremony dates, safety information

## 📧 Setting Up Custom Emails in ConvertKit

### Step 1: Create Email Sequences
1. Go to **Broadcasts** → **Sequences**
2. Create a new sequence for each tag:
   - "Welcome - General Newsletter"
   - "Welcome - Temple Interest"
   - "Welcome - Retreats Waitlist"
   - "Welcome - Kambo Interest"

### Step 2: Set Up Automations
1. Go to **Automations**
2. Create automation: **When someone is tagged**
3. Select the tag (e.g., `interest-temple`)
4. Add action: **Send email sequence**
5. Select the corresponding sequence

### Step 3: Create Tag-Based Broadcasts
1. Go to **Broadcasts** → **New Broadcast**
2. Select **Send to a tag**
3. Choose the appropriate tag
4. Write and send targeted emails

## 🔧 Implementation on Pages

### Current Status
- ✅ Tag IDs configured in `config.js`
- ✅ JavaScript code ready in `main.js`
- ⚠️ HTML forms still use native ConvertKit embeds

### Next Steps: Replace Native Embeds with Tag-Based Forms

#### Homepage (`index.html`)
Replace:
```html
<div class="newsletter-form" data-uid="d9e2ef73ad"></div>
<script async data-uid="d9e2ef73ad" src="https://medicine-within.kit.com/d9e2ef73ad/index.js"></script>
```

With:
```html
<form data-ck-tags="13000746" class="newsletter-form">
    <input type="email" name="email" placeholder="Enter your email" required>
    <button type="submit">Join the Circle</button>
</form>
```

#### Temple Page (`temple.html`)
Replace native embed with:
```html
<form data-ck-tags="13000747" class="newsletter-form">
    <input type="email" name="email" placeholder="Enter your email" required>
    <button type="submit">Get Early Access</button>
</form>
```

#### Retreats Page (`retreats.html`)
Replace native embed with:
```html
<form data-ck-tags="13000748" class="newsletter-form">
    <input type="email" name="email" placeholder="Enter your email" required>
    <button type="submit">Join Waitlist</button>
</form>
```

#### Kambo Page (`kambo.html`)
Replace native embed with:
```html
<form data-ck-tags="13000749" class="newsletter-form">
    <input type="email" name="email" placeholder="Enter your email" required>
    <button type="submit">Get Updates</button>
</form>
```

## 🎨 Form Styling

The forms will automatically use the existing CSS styles in `style.css`. The `ConvertKitManager` in `main.js` handles:
- Form submission
- Email validation
- Loading states
- Success/error messages
- API calls to ConvertKit

## ✅ Testing Checklist

- [x] Tag IDs retrieved and added to config
- [x] All four tags tested via API
- [x] Subscribers created successfully
- [x] Tags assigned correctly
- [ ] HTML forms updated to use tag-based system
- [ ] Forms tested on each page
- [ ] Email sequences created in ConvertKit
- [ ] Automations set up for each tag
- [ ] Test subscription from each page
- [ ] Verify tags in ConvertKit dashboard
- [ ] Verify welcome emails are sent

## 📝 Notes

- Test subscribers were created with emails like `test-interest-*-{timestamp}@test.medicinewithin.nl`
- You can delete these test subscribers from ConvertKit dashboard after verification
- The tag-based system allows subscribers to have multiple tags (e.g., someone interested in both Temple and Kambo)
- Tags are applied immediately upon form submission


