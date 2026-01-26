<?php
/**
 * Shortcode handler
 */

if (!defined('WPINC')) {
    die;
}

class UST_Shortcode {
    
    /**
     * Register shortcode
     */
    public function register_shortcode() {
        add_shortcode('user_dashboard', array($this, 'render_dashboard'));
    }
    
    /**
     * Render dashboard
     */
    public function render_dashboard($atts) {
        // If user is not logged in, show login form
        if (!is_user_logged_in()) {
            return $this->render_login_form();
        }
        
        // Render React app container
        ob_start();
        ?>
        <div id="ust-dashboard-root" class="ust-dashboard-wrapper">
            <div class="ust-loading">Loading dashboard...</div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render login form
     */
    private function render_login_form() {
        ob_start();
        ?>
        <div class="ust-login-wrapper">
            <div class="ust-login-container">
                <h2>Login to Access Dashboard</h2>
                <?php
                wp_login_form(array(
                    'redirect' => get_permalink(),
                    'form_id' => 'ust-loginform',
                    'label_username' => __('Username or Email'),
                    'label_password' => __('Password'),
                    'label_remember' => __('Remember Me'),
                    'label_log_in' => __('Log In'),
                    'remember' => true
                ));
                ?>
                <p class="ust-register-link">
                    Don't have an account? <a href="<?php echo wp_registration_url(); ?>">Register here</a>
                </p>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}
