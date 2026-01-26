<?php
/**
 * Core plugin class
 */

if (!defined('WPINC')) {
    die;
}

class UST_Core {
    
    /**
     * The loader that's responsible for maintaining and registering all hooks
     */
    protected $loader;
    
    /**
     * The unique identifier of this plugin
     */
    protected $plugin_name;
    
    /**
     * The current version of the plugin
     */
    protected $version;
    
    /**
     * Initialize the class
     */
    public function __construct() {
        $this->version = UST_VERSION;
        $this->plugin_name = 'user-support-tickets';
        
        $this->load_dependencies();
        $this->define_hooks();
    }
    
    /**
     * Load required dependencies
     */
    private function load_dependencies() {
        // Loader class
        require_once UST_PLUGIN_DIR . 'includes/class-ust-loader.php';
        
        // REST API
        require_once UST_PLUGIN_DIR . 'includes/class-ust-rest-api.php';
        
        // Shortcode
        require_once UST_PLUGIN_DIR . 'includes/class-ust-shortcode.php';
        
        // Database operations
        require_once UST_PLUGIN_DIR . 'includes/class-ust-database.php';
        
        $this->loader = new UST_Loader();
    }
    
    /**
     * Register all hooks
     */
    private function define_hooks() {
        // Enqueue scripts and styles
        $this->loader->add_action('wp_enqueue_scripts', $this, 'enqueue_public_assets');
        
        // Register REST API endpoints
        $rest_api = new UST_REST_API();
        $this->loader->add_action('rest_api_init', $rest_api, 'register_routes');
        
        // Register shortcode
        $shortcode = new UST_Shortcode();
        $this->loader->add_action('init', $shortcode, 'register_shortcode');
    }
    
    /**
     * Enqueue public-facing assets
     */
    public function enqueue_public_assets() {
        // Only load on dashboard page
        if (!is_page() && !has_shortcode(get_post()->post_content, 'user_dashboard')) {
            return;
        }
        
        // Enqueue styles
        wp_enqueue_style(
            $this->plugin_name,
            UST_PLUGIN_URL . 'assets/css/style.css',
            array(),
            $this->version,
            'all'
        );
        
        // Enqueue React app
        $asset_file = UST_PLUGIN_DIR . 'assets/js/build/index.asset.php';
        
        if (file_exists($asset_file)) {
            $asset = include $asset_file;
            
            wp_enqueue_script(
                $this->plugin_name,
                UST_PLUGIN_URL . 'assets/js/build/index.js',
                $asset['dependencies'],
                $asset['version'],
                true
            );
        } else {
            // Fallback if build doesn't exist
            wp_enqueue_script(
                $this->plugin_name,
                UST_PLUGIN_URL . 'assets/js/dashboard.js',
                array('wp-element', 'wp-api-fetch'),
                $this->version,
                true
            );
        }
        
        // Localize script
        wp_localize_script(
            $this->plugin_name,
            'ustData',
            array(
                'apiUrl' => rest_url('ust/v1'),
                'nonce' => wp_create_nonce('wp_rest'),
                'currentUser' => get_current_user_id(),
                'isLoggedIn' => is_user_logged_in(),
                'ajaxUrl' => admin_url('admin-ajax.php')
            )
        );
    }
    
    /**
     * Run the loader
     */
    public function run() {
        $this->loader->run();
    }
}
