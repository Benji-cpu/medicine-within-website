# WordPress Migration Guide - ConvertKit Configuration

## ✅ Configuration Status

All required ConvertKit configuration data is complete and ready for WordPress migration:

### ConvertKit API Keys
- ✅ **API v3 (Public Key)**: `eludDXTW2eHbUSOm5ORwEQ` - Safe for frontend use
- ✅ **API v4**: `kit_b6f0dc48d67c518540c80d9f22aef2dc` - For future use
- ✅ **API Base URL**: `https://api.convertkit.com/v3`

### Form IDs (Legacy - for reference)
- ✅ **General Newsletter**: `8824122` (Homepage "Join the Circle")
- ✅ **Temple**: `8824140` (Temple "Get Early Access")
- ✅ **Retreats**: `8824150` (Retreats "Join Waitlist")
- ✅ **Kambo**: `8824159` (Kambo "Get Updates")

### Tag IDs (Active - for tag-based subscriptions)
- ✅ **General Newsletter**: `13000746` (`interest-general`)
- ✅ **Temple**: `13000747` (`interest-temple`)
- ✅ **Retreats**: `13000748` (`interest-retreats`)
- ✅ **Kambo**: `13000749` (`interest-kambo`)

### Hipsy Configuration
- ✅ **API Key**: `17173|iviQqmIxb5h95iTC9B9h352bYf3sHr60FxlWwqiF0e025d3e`
- ✅ **API Endpoint**: `https://api.hipsy.nl/v1/events`
- ✅ **Profile URL**: `https://www.hipsy.nl/organisator/medicine-within`

## 📦 Files to Migrate to WordPress

### Required JavaScript Files
1. **`js/config.js`** - Contains all API keys and configuration
2. **`js/main.js`** - Contains ConvertKitManager and form handling logic

### Required CSS
- **`css/style.css`** - Contains form styling (newsletter forms section)

### Test/Verification Files (Optional)
- `test-tag-subscriptions.html` - For testing tag subscriptions
- `js/test-tag-api.js` - Browser console test script
- `js/verify-config.html` - Configuration verification page

## 🔧 WordPress Implementation Options

### Option 1: Enqueue Scripts in Theme (Recommended)

Add to your theme's `functions.php`:

```php
function medicine_within_enqueue_scripts() {
    // Enqueue ConvertKit configuration
    wp_enqueue_script(
        'medicine-within-config',
        get_template_directory_uri() . '/js/config.js',
        array(),
        '1.0.0',
        false
    );
    
    // Enqueue main JavaScript (depends on config)
    wp_enqueue_script(
        'medicine-within-main',
        get_template_directory_uri() . '/js/main.js',
        array('medicine-within-config'),
        '1.0.0',
        true
    );
    
    // Enqueue styles
    wp_enqueue_style(
        'medicine-within-styles',
        get_template_directory_uri() . '/css/style.css',
        array(),
        '1.0.0'
    );
}
add_action('wp_enqueue_scripts', 'medicine_within_enqueue_scripts');
```

### Option 2: Use WordPress Customizer/Options

Store configuration in WordPress options (more secure for API keys):

```php
// In functions.php or a custom plugin
function medicine_within_get_config() {
    return array(
        'convertKit' => array(
            'apiKey' => get_option('ck_api_key', 'eludDXTW2eHbUSOm5ORwEQ'),
            'apiKeyV4' => get_option('ck_api_key_v4', 'kit_b6f0dc48d67c518540c80d9f22aef2dc'),
            'apiBase' => 'https://api.convertkit.com/v3',
            'forms' => array(
                'general' => get_option('ck_form_general', '8824122'),
                'temple' => get_option('ck_form_temple', '8824140'),
                'retreats' => get_option('ck_form_retreats', '8824150'),
                'kambo' => get_option('ck_form_kambo', '8824159'),
            ),
            'tags' => array(
                'general' => get_option('ck_tag_general', '13000746'),
                'temple' => get_option('ck_tag_temple', '13000747'),
                'retreats' => get_option('ck_tag_retreats', '13000748'),
                'kambo' => get_option('ck_tag_kambo', '13000749'),
            ),
        ),
        'hipsy' => array(
            'apiKey' => get_option('hipsy_api_key', '17173|iviQqmIxb5h95iTC9B9h352bYf3sHr60FxlWwqiF0e025d3e'),
            'apiEndpoint' => 'https://api.hipsy.nl/v1/events',
            'profileUrl' => 'https://www.hipsy.nl/organisator/medicine-within',
        ),
    );
}

// Output config as JavaScript
function medicine_within_output_config() {
    $config = medicine_within_get_config();
    ?>
    <script>
        window.MEDICINE_WITHIN_CONFIG = <?php echo json_encode($config); ?>;
    </script>
    <?php
}
add_action('wp_head', 'medicine_within_output_config', 5);
```

### Option 3: Use Environment Variables (Most Secure)

For production, use environment variables:

```php
// In wp-config.php or via plugin
define('CK_API_KEY', getenv('CK_API_KEY') ?: 'eludDXTW2eHbUSOm5ORwEQ');
define('CK_TAG_GENERAL', getenv('CK_TAG_GENERAL') ?: '13000746');
// ... etc
```

## 📝 Form Implementation in WordPress

### Using Gutenberg Blocks or Page Builder

Replace native ConvertKit embeds with custom forms:

#### Homepage Form
```html
<form data-ck-tags="13000746" class="newsletter-form">
    <input type="email" name="email" placeholder="Enter your email" required>
    <button type="submit">Join the Circle</button>
</form>
```

#### Temple Page Form
```html
<form data-ck-tags="13000747" class="newsletter-form">
    <input type="email" name="email" placeholder="Enter your email" required>
    <button type="submit">Get Early Access</button>
</form>
```

#### Retreats Page Form
```html
<form data-ck-tags="13000748" class="newsletter-form">
    <input type="email" name="email" placeholder="Enter your email" required>
    <button type="submit">Join Waitlist</button>
</form>
```

#### Kambo Page Form
```html
<form data-ck-tags="13000749" class="newsletter-form">
    <input type="email" name="email" placeholder="Enter your email" required>
    <button type="submit">Get Updates</button>
</form>
```

### Using Shortcodes (Custom Plugin)

Create a shortcode for easy form insertion:

```php
function medicine_within_newsletter_form($atts) {
    $atts = shortcode_atts(array(
        'tag' => 'general', // general, temple, retreats, kambo
        'placeholder' => 'Enter your email',
        'button_text' => 'Subscribe'
    ), $atts);
    
    $config = medicine_within_get_config();
    $tagId = $config['convertKit']['tags'][$atts['tag']] ?? '13000746';
    
    ob_start();
    ?>
    <form data-ck-tags="<?php echo esc_attr($tagId); ?>" class="newsletter-form">
        <input type="email" name="email" placeholder="<?php echo esc_attr($atts['placeholder']); ?>" required>
        <button type="submit"><?php echo esc_html($atts['button_text']); ?></button>
    </form>
    <?php
    return ob_get_clean();
}
add_shortcode('newsletter_form', 'medicine_within_newsletter_form');
```

Usage:
```
[newsletter_form tag="general" placeholder="Enter your email" button_text="Join the Circle"]
[newsletter_form tag="temple" placeholder="Enter your email" button_text="Get Early Access"]
[newsletter_form tag="retreats" placeholder="Enter your email" button_text="Join Waitlist"]
[newsletter_form tag="kambo" placeholder="Enter your email" button_text="Get Updates"]
```

## 🔒 Security Considerations

### For Production WordPress Site

1. **Move API keys to environment variables** or WordPress options (not in public JS files)
2. **Use WordPress nonces** for form submissions (add to main.js if needed)
3. **Sanitize and validate** all form inputs server-side
4. **Consider using WordPress REST API** for form submissions instead of direct API calls

### Recommended: Server-Side Form Handler

Create a WordPress REST API endpoint for form submissions:

```php
// In functions.php or custom plugin
function medicine_within_register_rest_routes() {
    register_rest_route('medicine-within/v1', '/subscribe', array(
        'methods' => 'POST',
        'callback' => 'medicine_within_handle_subscription',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'medicine_within_register_rest_routes');

function medicine_within_handle_subscription($request) {
    $email = sanitize_email($request->get_param('email'));
    $tag_id = sanitize_text_field($request->get_param('tag_id'));
    
    if (!is_email($email) || empty($tag_id)) {
        return new WP_Error('invalid_data', 'Invalid email or tag ID', array('status' => 400));
    }
    
    $config = medicine_within_get_config();
    $api_key = $config['convertKit']['apiKey'];
    
    $response = wp_remote_post("https://api.convertkit.com/v3/tags/{$tag_id}/subscribe", array(
        'headers' => array('Content-Type' => 'application/json'),
        'body' => json_encode(array(
            'api_key' => $api_key,
            'email' => $email
        ))
    ));
    
    if (is_wp_error($response)) {
        return $response;
    }
    
    $body = json_decode(wp_remote_retrieve_body($response), true);
    return rest_ensure_response($body);
}
```

Then update `main.js` to use WordPress REST API instead of direct ConvertKit API calls.

## ✅ Migration Checklist

- [x] All ConvertKit API keys documented
- [x] All form IDs documented
- [x] All tag IDs documented and tested
- [x] Hipsy API key documented
- [x] JavaScript files ready (`config.js`, `main.js`)
- [x] CSS styles ready
- [ ] Upload files to WordPress theme directory
- [ ] Enqueue scripts in WordPress theme
- [ ] Replace native ConvertKit embeds with tag-based forms
- [ ] Test forms on each page
- [ ] Verify tags are assigned correctly
- [ ] Set up email sequences in ConvertKit
- [ ] Configure automations in ConvertKit
- [ ] Test end-to-end customer journey

## 🧪 Testing After Migration

1. **Test each form** on its respective page
2. **Verify in ConvertKit dashboard** that subscribers are tagged correctly
3. **Check browser console** for any JavaScript errors
4. **Test on mobile devices** to ensure forms work responsively
5. **Verify email sequences** are triggered correctly

## 📞 Support

If you encounter issues during migration:
1. Check browser console for JavaScript errors
2. Verify `window.MEDICINE_WITHIN_CONFIG` is loaded (check in console)
3. Test API calls directly using `test-tag-subscriptions.html`
4. Verify tag IDs in ConvertKit dashboard match config

## 📚 Additional Resources

- ConvertKit API Documentation: https://developers.kit.com/api-reference/v3
- WordPress Enqueue Scripts: https://developer.wordpress.org/reference/functions/wp_enqueue_script/
- WordPress REST API: https://developer.wordpress.org/rest-api/

