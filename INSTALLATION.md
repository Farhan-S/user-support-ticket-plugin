# Installation & Setup Guide

## Quick Start

### 1. Installation

**Method 1: Via WordPress Admin (Recommended)**
1. Download the plugin as a ZIP file
2. Go to WordPress Admin → Plugins → Add New
3. Click "Upload Plugin"
4. Choose the ZIP file and click "Install Now"
5. Click "Activate Plugin"

**Method 2: Manual Installation**
1. Extract the ZIP file
2. Upload the `user-support-tickets` folder to `/wp-content/plugins/`
3. Go to WordPress Admin → Plugins
4. Find "User Support Tickets" and click "Activate"

### 2. Verification

After activation, the plugin automatically:
- ✅ Creates database tables (`wp_ust_tickets` and `wp_ust_ticket_replies`)
- ✅ Creates a "User Dashboard" page with the `[user_dashboard]` shortcode
- ✅ Sets up REST API endpoints

### 3. Access the Dashboard

Visit: `https://yoursite.com/user-dashboard/`

Or find the page in: WordPress Admin → Pages → User Dashboard

## User Guide

### For End Users

#### Creating an Account
1. Visit the dashboard page
2. Click "Register here" link below the login form
3. Complete WordPress registration
4. Login with your credentials

#### Submitting a Ticket
1. Login to the dashboard
2. Click the "Create Ticket" tab
3. Enter:
   - Subject (required)
   - Message (required)
   - Priority (Low, Medium, High)
4. Click "Create Ticket"
5. You'll be redirected to view your tickets

#### Managing Tickets
1. Click "My Tickets" tab
2. Filter tickets by status:
   - All - View all tickets
   - Open - New tickets
   - In Progress - Tickets being worked on
   - Closed - Resolved tickets
3. Click "View / Reply" to see ticket details
4. Add replies for ongoing communication
5. Close tickets when resolved

#### Updating Profile
1. Click "Profile" tab
2. Click "Edit Profile"
3. Update first name, last name, or email
4. Click "Save Changes"

### For Administrators

#### Viewing All Tickets
Administrators can add custom admin pages to view all tickets (future enhancement).

Currently, tickets can be viewed directly from the database:
- Table: `wp_ust_tickets`
- Replies: `wp_ust_ticket_replies`

#### Admin Replies
When an admin (user with `manage_options` capability) replies to a ticket:
- The reply is marked with an "Admin" badge
- The `is_admin_reply` field is set to 1

## Configuration

### Customizing the Dashboard Page

You can add the dashboard to any page:

```php
[user_dashboard]
```

### Styling Customization

Override plugin styles in your theme's CSS:

```css
/* Custom theme styles */
.ust-dashboard {
    /* Your custom styles */
}
```

### Redirecting After Login

To redirect users to the dashboard after login:

```php
// Add to your theme's functions.php
add_filter('login_redirect', function($redirect_to, $request, $user) {
    if (!is_wp_error($user)) {
        // Get dashboard page URL
        $dashboard_page_id = get_option('ust_dashboard_page_id');
        if ($dashboard_page_id) {
            $redirect_to = get_permalink($dashboard_page_id);
        }
    }
    return $redirect_to;
}, 10, 3);
```

## Requirements

### Minimum Requirements
- WordPress: 5.0 or higher
- PHP: 7.4 or higher
- MySQL: 5.6 or higher

### Recommended
- WordPress: 6.0 or higher
- PHP: 8.0 or higher
- MySQL: 8.0 or higher
- HTTPS enabled

## Troubleshooting

### Issue: Dashboard shows "Loading..." indefinitely

**Solution:**
1. Check browser console for JavaScript errors
2. Verify REST API is working: Visit `yoursite.com/wp-json/ust/v1/stats`
3. Clear browser cache
4. Disable conflicting plugins

### Issue: "Permission denied" when creating tickets

**Solution:**
1. Ensure you're logged in
2. Check that cookies are enabled
3. Try logging out and back in
4. Clear browser cache

### Issue: Dashboard page not created

**Solution:**
1. Deactivate and reactivate the plugin
2. Or manually create a page with `[user_dashboard]` shortcode

### Issue: Styles not loading

**Solution:**
1. Clear WordPress cache (if using cache plugin)
2. Clear browser cache
3. Check file permissions on `/assets/css/style.css`
4. Verify theme compatibility

### Issue: REST API not working

**Solution:**
1. Check if REST API is enabled: Visit `yoursite.com/wp-json/`
2. Check permalink settings: WordPress Admin → Settings → Permalinks → Save
3. Check `.htaccess` file permissions
4. Verify server supports REST API

## Uninstallation

### Deactivation (Keep Data)
1. Go to WordPress Admin → Plugins
2. Find "User Support Tickets"
3. Click "Deactivate"

Data is preserved in the database.

### Complete Removal
1. Deactivate the plugin
2. Delete the plugin files
3. Run this SQL to remove database tables:

```sql
DROP TABLE IF EXISTS wp_ust_tickets;
DROP TABLE IF EXISTS wp_ust_ticket_replies;
DELETE FROM wp_options WHERE option_name LIKE 'ust_%';
```

## Support

For issues or questions:
1. Check the README.md file
2. Review this installation guide
3. Check WordPress error logs
4. Enable WordPress debugging (see below)

### Enable WordPress Debugging

Add to `wp-config.php`:

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Check `/wp-content/debug.log` for errors.

## Security Recommendations

1. **Keep WordPress Updated** - Always use the latest version
2. **Use Strong Passwords** - For all user accounts
3. **Enable HTTPS** - Secure all data transmission
4. **Regular Backups** - Backup database and files regularly
5. **Limit Login Attempts** - Use a security plugin
6. **Monitor Activity** - Check tickets regularly for abuse

## Performance Tips

1. **Use Caching** - Install a caching plugin (W3 Total Cache, WP Super Cache)
2. **Optimize Database** - Use WP-Optimize or similar
3. **CDN** - Consider using a CDN for assets
4. **Regular Cleanup** - Archive or delete old closed tickets

## Browser Compatibility

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

The plugin follows basic accessibility guidelines:
- Semantic HTML5 elements
- Keyboard navigation support
- Screen reader friendly labels
- Color contrast compliance

---

**Need Help?** Check the README.md file for more detailed technical information.
