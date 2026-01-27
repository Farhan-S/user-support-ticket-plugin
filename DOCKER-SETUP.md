# Docker Setup Instructions

## Quick Start

### 1. Start Docker Containers

```bash
cd /home/betopia/projects/user-support-ticket-plugin
docker-compose up -d
```

This will start:
- **WordPress** on http://localhost:8080
- **phpMyAdmin** on http://localhost:8081
- **MySQL** database

### 2. Wait for Services

Wait 30-60 seconds for all services to initialize. Check status with:

```bash
docker-compose ps
```

All services should show "Up" status.

### 3. Install WordPress

1. Open your browser and go to: **http://localhost:8080**
2. Select your language
3. Fill in the WordPress installation form:
   - Site Title: `My Support Site`
   - Username: `admin`
   - Password: `admin` (or create a strong password)
   - Email: your email address
4. Click "Install WordPress"

### 4. Login to WordPress Admin

1. Go to: **http://localhost:8080/wp-admin**
2. Login with the credentials you created
3. Username: `admin`
4. Password: (the one you set)

### 5. Activate the Plugin

1. In WordPress Admin, go to **Plugins** → **Installed Plugins**
2. Find "User Support Tickets"
3. Click **Activate**
4. The plugin will automatically create a "User Dashboard" page

### 6. Test the Plugin

#### Create a Test User:
1. Go to **Users** → **Add New**
2. Create a test user:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `testuser123`
   - Role: `Subscriber`
3. Click "Add New User"

#### Test as Regular User:
1. **Logout** from admin account
2. Login as `testuser` with password `testuser123`
3. Visit: **http://localhost:8080/user-dashboard**
4. You should see the User Dashboard with:
   - Profile section
   - Create Ticket form
   - My Tickets list

#### Create Test Tickets:
1. Click "Create Ticket" tab
2. Fill in:
   - Subject: "Test Issue"
   - Priority: Select any
   - Message: "This is a test ticket"
3. Click "Create Ticket"
4. Verify it appears in "My Tickets"

#### Test Replies:
1. Click "View / Reply" on a ticket
2. Add a reply
3. Close the ticket

### 7. Test as Admin

1. **Logout** from testuser
2. Login as **admin**
3. Go to: **http://localhost:8080/user-dashboard**
4. Admins can also use the dashboard
5. Admin replies will be marked with "Admin" badge

## Container Management

### View Logs
```bash
# All services
docker-compose logs -f

# WordPress only
docker-compose logs -f wordpress

# Database only
docker-compose logs -f db
```

### Stop Containers
```bash
docker-compose stop
```

### Start Containers
```bash
docker-compose start
```

### Restart Containers
```bash
docker-compose restart
```

### Stop and Remove Containers
```bash
docker-compose down
```

### Stop and Remove Everything (including volumes)
```bash
docker-compose down -v
```
**Warning:** This will delete all WordPress data and database!

## Database Access

### Using phpMyAdmin
1. Go to: **http://localhost:8081**
2. Login with:
   - Server: `db`
   - Username: `root`
   - Password: `rootpassword`
3. Select the `wordpress` database
4. View plugin tables:
   - `wp_ust_tickets`
   - `wp_ust_ticket_replies`

### Using MySQL CLI
```bash
docker-compose exec db mysql -u wordpress -pwordpress wordpress
```

Then run SQL queries:
```sql
SELECT * FROM wp_ust_tickets;
SELECT * FROM wp_ust_ticket_replies;
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

### Port Already in Use
If port 8080 is already in use, edit `docker-compose.yml` and change:
```yaml
ports:
  - "8081:80"  # Change 8080 to 8081 or any free port
```

### Reset Everything
```bash
# Stop and remove all
docker-compose down -v

# Start fresh
docker-compose up -d
```

### Plugin Not Showing Up
```bash
# Check if plugin directory is mounted
docker-compose exec wordpress ls -la /var/www/html/wp-content/plugins/

# Should see user-support-tickets directory
```

### File Permission Issues
```bash
# Fix permissions
sudo chown -R www-data:www-data /var/lib/docker/volumes/
```

## Development Workflow

### Make Changes to Plugin Files
The plugin directory is mounted as a volume, so any changes you make to the files will immediately reflect in the WordPress installation.

After editing PHP files:
1. No need to restart - just refresh the page
2. For JavaScript/CSS changes, clear browser cache or do hard refresh (Ctrl+Shift+R)

### View WordPress Debug Log
```bash
docker-compose exec wordpress tail -f /var/www/html/wp-content/debug.log
```

## URLs Reference

- **WordPress Site**: http://localhost:8080
- **WordPress Admin**: http://localhost:8080/wp-admin
- **User Dashboard**: http://localhost:8080/user-dashboard
- **phpMyAdmin**: http://localhost:8081
- **REST API Base**: http://localhost:8080/wp-json/ust/v1/

## Default Credentials

### WordPress Admin
- URL: http://localhost:8080/wp-admin
- Username: (set during installation)
- Password: (set during installation)

### Database
- Host: `db`
- Database: `wordpress`
- User: `wordpress`
- Password: `wordpress`
- Root Password: `rootpassword`

### phpMyAdmin
- URL: http://localhost:8081
- Username: `root`
- Password: `rootpassword`

## REST API Testing

### Using curl

```bash
# Get your nonce first by logging in and checking browser console

# Get tickets
curl -X GET http://localhost:8080/wp-json/ust/v1/tickets \
  -H "X-WP-Nonce: YOUR_NONCE"

# Create ticket
curl -X POST http://localhost:8080/wp-json/ust/v1/tickets \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: YOUR_NONCE" \
  -d '{"subject":"API Test","message":"Testing via API","priority":"medium"}'

# Get stats
curl -X GET http://localhost:8080/wp-json/ust/v1/stats \
  -H "X-WP-Nonce: YOUR_NONCE"
```

## Next Steps

1. ✅ Start Docker: `docker-compose up -d`
2. ✅ Install WordPress: http://localhost:8080
3. ✅ Activate Plugin: WordPress Admin → Plugins
4. ✅ Create Test User
5. ✅ Test Dashboard: http://localhost:8080/user-dashboard
6. ✅ Create and manage tickets
7. ✅ Test reply functionality
