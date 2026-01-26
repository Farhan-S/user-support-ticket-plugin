# User Support Tickets - WordPress Plugin

A comprehensive WordPress plugin that provides a complete support ticket system with user dashboard, profile management, and ticket submission capabilities using REST API.

## 📋 Project Overview

This plugin allows users to log into a frontend dashboard where they can:
- Manage their profile
- Submit support tickets to the admin
- View and track their tickets with real-time status updates
- Reply to tickets for ongoing communication

## ⚡ Key Features

### ✅ Core Features Implemented

1. **Auto-Generated Dashboard Page**
   - Automatically creates a "User Dashboard" page with `[user_dashboard]` shortcode upon plugin activation
   - No manual setup required

2. **User Profile Management**
   - View profile details (username, email, first name, last name, registration date)
   - Edit profile information with validation
   - Update email with duplicate checking

3. **Support Ticket System**
   - Create new support tickets with subject, message, and priority levels (Low, Medium, High)
   - View all tickets with status filtering (All, Open, In Progress, Closed)
   - Real-time ticket statistics dashboard
   - Close tickets when resolved

4. **Ticket Status Tracking**
   - Open - Newly created tickets
   - In Progress - Tickets being worked on
   - Closed - Resolved tickets

5. **Reply System** (Bonus Feature)
   - Add replies to existing tickets
   - View conversation thread for each ticket
   - Admin replies are highlighted with special badges
   - Timestamp tracking for all replies

6. **Authentication & Security**
   - Login form for logged-out users
   - Protected REST API endpoints with nonce verification
   - Capability checks for user permissions
   - Input sanitization and validation
   - SQL injection prevention

7. **Responsive Design**
   - 100% mobile-responsive interface
   - Works seamlessly on desktop, tablet, and mobile devices
   - Touch-friendly UI elements
   - Adaptive layouts for all screen sizes

## 🛠 Tech Stack

### Backend
- **PHP 7.4+** - Core plugin development
- **WordPress REST API** - For all CRUD operations
- **MySQL** - Database (custom tables for tickets and replies)
- **WordPress Hooks & Filters** - Plugin architecture

### Frontend
- **React (via wp.element)** - Modern UI components
- **Vanilla JavaScript** - For React integration
- **CSS3** - Responsive styling with Grid and Flexbox
- **WordPress wp-api-fetch** - API communication

### Security
- **WordPress Nonce** - CSRF protection
- **Sanitization Functions** - Input cleaning (`sanitize_text_field`, `wp_kses_post`, `sanitize_email`)
- **Validation** - Email validation, capability checks
- **Prepared Statements** - SQL injection prevention

## 📁 Plugin Structure

```
user-support-tickets/
├── user-support-tickets.php       # Main plugin file
├── includes/
│   ├── class-ust-activator.php    # Plugin activation logic
│   ├── class-ust-deactivator.php  # Plugin deactivation logic
│   ├── class-ust-core.php         # Core plugin class
│   ├── class-ust-loader.php       # Hooks loader
│   ├── class-ust-database.php     # Database operations
│   ├── class-ust-rest-api.php     # REST API endpoints
│   └── class-ust-shortcode.php    # Shortcode handler
├── assets/
│   ├── css/
│   │   └── style.css              # Responsive styles
│   └── js/
│       └── dashboard.js           # React dashboard app
└── README.md                       # This file
```

## 🚀 Installation

1. **Upload the Plugin**
   ```bash
   # Copy the plugin folder to WordPress plugins directory
   cp -r user-support-tickets /path/to/wordpress/wp-content/plugins/
   ```

2. **Activate the Plugin**
   - Navigate to WordPress Admin → Plugins
   - Find "User Support Tickets"
   - Click "Activate"

3. **Dashboard Page**
   - A page titled "User Dashboard" is automatically created
   - The shortcode `[user_dashboard]` is already added
   - Access the dashboard at: `yoursite.com/user-dashboard`

## 📡 REST API Endpoints

All endpoints use the namespace `ust/v1` and require user authentication.

### Profile Endpoints
- `GET /ust/v1/profile` - Get current user profile
- `POST /ust/v1/profile` - Update user profile

### Ticket Endpoints
- `GET /ust/v1/tickets` - Get all user tickets (optional status filter)
- `POST /ust/v1/tickets` - Create new ticket
- `GET /ust/v1/tickets/{id}` - Get single ticket
- `PUT /ust/v1/tickets/{id}` - Update ticket status
- `DELETE /ust/v1/tickets/{id}` - Delete ticket

### Reply Endpoints
- `GET /ust/v1/tickets/{id}/replies` - Get ticket replies
- `POST /ust/v1/tickets/{id}/replies` - Add reply to ticket

### Statistics
- `GET /ust/v1/stats` - Get ticket statistics

## 🔒 Security Features

1. **Nonce Verification**
   - All API requests include WordPress nonce for CSRF protection
   - Nonces are validated on every request

2. **Capability Checks**
   - Only logged-in users can access the dashboard
   - Users can only view/edit their own tickets
   - Admin-specific features are protected

3. **Input Sanitization**
   - `sanitize_text_field()` for text inputs
   - `sanitize_email()` for email addresses
   - `wp_kses_post()` for message content
   - `absint()` for numeric values

4. **SQL Security**
   - `$wpdb->prepare()` for all database queries
   - Prevents SQL injection attacks

## 💡 Usage

### For End Users

1. **Login**
   - Visit the dashboard page
   - Login with your WordPress credentials
   - Non-logged-in users see only the login form

2. **Manage Profile**
   - Click "Profile" tab
   - Click "Edit Profile" button
   - Update your information
   - Click "Save Changes"

3. **Create Ticket**
   - Click "Create Ticket" tab
   - Fill in subject and message
   - Select priority level
   - Click "Create Ticket"

4. **View Tickets**
   - Click "My Tickets" tab
   - Filter by status (All, Open, In Progress, Closed)
   - Click "View / Reply" to see details
   - Add replies to ongoing tickets
   - Close resolved tickets

### For Developers

**Using the Shortcode:**
```php
// In any page or post
[user_dashboard]

// In theme template
<?php echo do_shortcode('[user_dashboard]'); ?>
```

**Extending the Plugin:**
```php
// Hook into ticket creation
add_action('ust_ticket_created', function($ticket_id) {
    // Your custom code
}, 10, 1);

// Filter ticket data before creation
add_filter('ust_before_create_ticket', function($data) {
    // Modify ticket data
    return $data;
}, 10, 1);
```

## 📊 Database Schema

### ust_tickets Table
```sql
- id (bigint)
- user_id (bigint)
- subject (varchar 255)
- message (text)
- status (varchar 20) [open, in_progress, closed]
- priority (varchar 20) [low, medium, high]
- created_at (datetime)
- updated_at (datetime)
```

### ust_ticket_replies Table
```sql
- id (bigint)
- ticket_id (bigint)
- user_id (bigint)
- message (text)
- is_admin_reply (tinyint)
- created_at (datetime)
```

## ⏱ Development Time

**Total Time: ~6 hours**

### Time Breakdown:
- **Planning & Architecture** (1 hour)
  - Database schema design
  - API endpoint planning
  - Component structure

- **Backend Development** (2.5 hours)
  - Plugin core structure
  - Database operations class
  - REST API endpoints implementation
  - Security implementation (nonce, sanitization)
  - Activation/deactivation hooks

- **Frontend Development** (2 hours)
  - React components (Dashboard, Profile, Tickets, Replies)
  - State management
  - API integration
  - Form handling and validation

- **Styling & Responsiveness** (0.5 hours)
  - CSS Grid/Flexbox layouts
  - Mobile-first responsive design
  - Color scheme and UI polish

## 🎯 Why This Tech Stack?

### PHP Backend
- **Native WordPress Integration** - No additional dependencies
- **Performance** - Direct database access via WordPress APIs
- **Compatibility** - Works with any WordPress hosting
- **Security** - Leverages WordPress security functions

### REST API
- **Decoupled Architecture** - Frontend and backend are independent
- **Scalability** - Easy to add mobile apps or other frontends
- **Modern Standard** - Industry best practice for web applications
- **WordPress Core** - Built-in WordPress feature, no plugins needed

### React (via wp.element)
- **Component-Based** - Reusable, maintainable code
- **Fast UI Updates** - Virtual DOM for smooth interactions
- **WordPress Native** - Uses WordPress's bundled React library
- **No Build Process** - Works directly without webpack/babel setup

### Custom Database Tables
- **Performance** - Optimized queries without post meta overhead
- **Scalability** - Handles thousands of tickets efficiently
- **Data Integrity** - Proper relational structure
- **Flexibility** - Easy to add custom fields and indexes

## 🚦 Testing

1. **Install on WordPress 5.0+**
2. **Activate the plugin**
3. **Test as logged-out user** - Should see login form
4. **Login and test:**
   - Profile editing
   - Ticket creation
   - Ticket viewing and filtering
   - Reply functionality
   - Ticket status updates

## 🔄 Future Enhancements

- Email notifications for new tickets and replies
- File attachment support
- Ticket assignment to specific admins
- Advanced search and filtering
- Ticket categories/tags
- Export tickets to CSV
- Admin dashboard in wp-admin
- Multi-language support (i18n)

## 📝 License

GPL v2 or later - Compatible with WordPress licensing

## 👨‍💻 Author

Developed as a comprehensive WordPress plugin demonstration showcasing:
- Modern PHP development practices
- RESTful API design
- React integration in WordPress
- Security best practices
- Responsive design principles

---

**Note:** This plugin was developed following WordPress coding standards and best practices. All code is production-ready and fully tested.
