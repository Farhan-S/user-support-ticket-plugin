<?php
/**
 * Fired during plugin activation
 */

if (!defined('WPINC')) {
    die;
}

class UST_Activator {
    
    /**
     * Plugin activation
     */
    public static function activate() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Create tickets table
        $tickets_table = $wpdb->prefix . 'ust_tickets';
        $sql_tickets = "CREATE TABLE IF NOT EXISTS $tickets_table (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id bigint(20) UNSIGNED NOT NULL,
            subject varchar(255) NOT NULL,
            message text NOT NULL,
            status varchar(20) DEFAULT 'open',
            priority varchar(20) DEFAULT 'medium',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY status (status)
        ) $charset_collate;";
        
        // Create ticket replies table
        $replies_table = $wpdb->prefix . 'ust_ticket_replies';
        $sql_replies = "CREATE TABLE IF NOT EXISTS $replies_table (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            ticket_id bigint(20) UNSIGNED NOT NULL,
            user_id bigint(20) UNSIGNED NOT NULL,
            message text NOT NULL,
            is_admin_reply tinyint(1) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY ticket_id (ticket_id),
            KEY user_id (user_id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql_tickets);
        dbDelta($sql_replies);
        
        // Create dashboard page with shortcode
        self::create_dashboard_page();
        
        // Set default options
        add_option('ust_version', UST_VERSION);
        add_option('ust_installed', current_time('mysql'));
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    /**
     * Create dashboard page
     */
    private static function create_dashboard_page() {
        // Check if page already exists
        $page_check = get_page_by_path('user-dashboard');
        
        if (!$page_check) {
            $page_data = array(
                'post_title'    => 'User Dashboard',
                'post_content'  => '[user_dashboard]',
                'post_status'   => 'publish',
                'post_type'     => 'page',
                'post_author'   => 1,
                'comment_status' => 'closed',
                'ping_status'   => 'closed'
            );
            
            $page_id = wp_insert_post($page_data);
            
            if ($page_id) {
                update_option('ust_dashboard_page_id', $page_id);
            }
        }
    }
}
