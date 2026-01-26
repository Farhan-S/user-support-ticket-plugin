<?php
/**
 * Fired during plugin deactivation
 */

if (!defined('WPINC')) {
    die;
}

class UST_Deactivator {
    
    /**
     * Plugin deactivation
     */
    public static function deactivate() {
        // Flush rewrite rules
        flush_rewrite_rules();
    }
}
