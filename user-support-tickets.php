<?php
/**
 * Plugin Name: User Support Tickets
 * Plugin URI: https://github.com/yourusername/user-support-tickets
 * Description: A comprehensive support ticket system with user dashboard, profile management, and ticket submission via REST API
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://yourwebsite.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: user-support-tickets
 * Domain Path: /languages
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

// Define plugin constants
define('UST_VERSION', '1.0.0');
define('UST_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UST_PLUGIN_URL', plugin_dir_url(__FILE__));
define('UST_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * The code that runs during plugin activation.
 */
function activate_user_support_tickets() {
    require_once UST_PLUGIN_DIR . 'includes/class-ust-activator.php';
    UST_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 */
function deactivate_user_support_tickets() {
    require_once UST_PLUGIN_DIR . 'includes/class-ust-deactivator.php';
    UST_Deactivator::deactivate();
}

register_activation_hook(__FILE__, 'activate_user_support_tickets');
register_deactivation_hook(__FILE__, 'deactivate_user_support_tickets');

/**
 * The core plugin class
 */
require UST_PLUGIN_DIR . 'includes/class-ust-core.php';

/**
 * Begins execution of the plugin.
 */
function run_user_support_tickets() {
    $plugin = new UST_Core();
    $plugin->run();
}

run_user_support_tickets();
