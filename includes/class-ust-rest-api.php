<?php
/**
 * REST API endpoints
 */

if (!defined('WPINC')) {
    die;
}

class UST_REST_API {
    
    /**
     * Namespace
     */
    private $namespace = 'ust/v1';
    
    /**
     * Register REST API routes
     */
    public function register_routes() {
        // Get current user profile
        register_rest_route($this->namespace, '/profile', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_profile'),
            'permission_callback' => array($this, 'check_user_permission')
        ));
        
        // Update user profile
        register_rest_route($this->namespace, '/profile', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_profile'),
            'permission_callback' => array($this, 'check_user_permission'),
            'args' => array(
                'first_name' => array(
                    'required' => false,
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'last_name' => array(
                    'required' => false,
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'email' => array(
                    'required' => false,
                    'sanitize_callback' => 'sanitize_email',
                    'validate_callback' => 'is_email'
                )
            )
        ));
        
        // Get tickets
        register_rest_route($this->namespace, '/tickets', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_tickets'),
            'permission_callback' => array($this, 'check_user_permission'),
            'args' => array(
                'status' => array(
                    'required' => false,
                    'sanitize_callback' => 'sanitize_text_field'
                )
            )
        ));
        
        // Create ticket
        register_rest_route($this->namespace, '/tickets', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_ticket'),
            'permission_callback' => array($this, 'check_user_permission'),
            'args' => array(
                'subject' => array(
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field',
                    'validate_callback' => function($value) {
                        return !empty($value);
                    }
                ),
                'message' => array(
                    'required' => true,
                    'sanitize_callback' => 'wp_kses_post',
                    'validate_callback' => function($value) {
                        return !empty($value);
                    }
                ),
                'priority' => array(
                    'required' => false,
                    'sanitize_callback' => 'sanitize_text_field',
                    'default' => 'medium'
                )
            )
        ));
        
        // Get single ticket
        register_rest_route($this->namespace, '/tickets/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_ticket'),
            'permission_callback' => array($this, 'check_user_permission'),
            'args' => array(
                'id' => array(
                    'validate_callback' => function($value) {
                        return is_numeric($value);
                    }
                )
            )
        ));
        
        // Update ticket
        register_rest_route($this->namespace, '/tickets/(?P<id>\d+)', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_ticket'),
            'permission_callback' => array($this, 'check_user_permission'),
            'args' => array(
                'id' => array(
                    'validate_callback' => function($value) {
                        return is_numeric($value);
                    }
                ),
                'status' => array(
                    'required' => false,
                    'sanitize_callback' => 'sanitize_text_field'
                )
            )
        ));
        
        // Delete ticket
        register_rest_route($this->namespace, '/tickets/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_ticket'),
            'permission_callback' => array($this, 'check_user_permission'),
            'args' => array(
                'id' => array(
                    'validate_callback' => function($value) {
                        return is_numeric($value);
                    }
                )
            )
        ));
        
        // Get ticket replies
        register_rest_route($this->namespace, '/tickets/(?P<id>\d+)/replies', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_replies'),
            'permission_callback' => array($this, 'check_user_permission'),
            'args' => array(
                'id' => array(
                    'validate_callback' => function($value) {
                        return is_numeric($value);
                    }
                )
            )
        ));
        
        // Create ticket reply
        register_rest_route($this->namespace, '/tickets/(?P<id>\d+)/replies', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_reply'),
            'permission_callback' => array($this, 'check_user_permission'),
            'args' => array(
                'id' => array(
                    'validate_callback' => function($value) {
                        return is_numeric($value);
                    }
                ),
                'message' => array(
                    'required' => true,
                    'sanitize_callback' => 'wp_kses_post',
                    'validate_callback' => function($value) {
                        return !empty($value);
                    }
                )
            )
        ));
        
        // Get ticket statistics
        register_rest_route($this->namespace, '/stats', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_stats'),
            'permission_callback' => array($this, 'check_user_permission')
        ));
    }
    
    /**
     * Check user permission
     */
    public function check_user_permission($request) {
        return is_user_logged_in();
    }
    
    /**
     * Get user profile
     */
    public function get_profile($request) {
        $user_id = get_current_user_id();
        $user = get_userdata($user_id);
        
        if (!$user) {
            return new WP_Error('user_not_found', 'User not found', array('status' => 404));
        }
        
        return rest_ensure_response(array(
            'id' => $user->ID,
            'username' => $user->user_login,
            'email' => $user->user_email,
            'first_name' => get_user_meta($user_id, 'first_name', true),
            'last_name' => get_user_meta($user_id, 'last_name', true),
            'display_name' => $user->display_name,
            'registered' => $user->user_registered
        ));
    }
    
    /**
     * Update user profile
     */
    public function update_profile($request) {
        $user_id = get_current_user_id();
        
        $updated = false;
        
        if ($request->has_param('first_name')) {
            update_user_meta($user_id, 'first_name', $request->get_param('first_name'));
            $updated = true;
        }
        
        if ($request->has_param('last_name')) {
            update_user_meta($user_id, 'last_name', $request->get_param('last_name'));
            $updated = true;
        }
        
        if ($request->has_param('email')) {
            $email = $request->get_param('email');
            
            if (email_exists($email) && email_exists($email) !== $user_id) {
                return new WP_Error('email_exists', 'Email already exists', array('status' => 400));
            }
            
            wp_update_user(array(
                'ID' => $user_id,
                'user_email' => $email
            ));
            $updated = true;
        }
        
        if ($updated) {
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'Profile updated successfully'
            ));
        }
        
        return new WP_Error('no_changes', 'No changes made', array('status' => 400));
    }
    
    /**
     * Get tickets
     */
    public function get_tickets($request) {
        $user_id = get_current_user_id();
        
        $args = array();
        
        if ($request->has_param('status')) {
            $args['status'] = $request->get_param('status');
        }
        
        $tickets = UST_Database::get_user_tickets($user_id, $args);
        
        return rest_ensure_response($tickets);
    }
    
    /**
     * Create ticket
     */
    public function create_ticket($request) {
        $user_id = get_current_user_id();
        
        $data = array(
            'user_id' => $user_id,
            'subject' => $request->get_param('subject'),
            'message' => $request->get_param('message'),
            'priority' => $request->get_param('priority') ?: 'medium',
            'status' => 'open'
        );
        
        $ticket_id = UST_Database::create_ticket($data);
        
        if ($ticket_id) {
            $ticket = UST_Database::get_ticket($ticket_id, $user_id);
            
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'Ticket created successfully',
                'ticket' => $ticket
            ));
        }
        
        return new WP_Error('ticket_creation_failed', 'Failed to create ticket', array('status' => 500));
    }
    
    /**
     * Get single ticket
     */
    public function get_ticket($request) {
        $user_id = get_current_user_id();
        $ticket_id = $request->get_param('id');
        
        $ticket = UST_Database::get_ticket($ticket_id, $user_id);
        
        if (!$ticket) {
            return new WP_Error('ticket_not_found', 'Ticket not found', array('status' => 404));
        }
        
        return rest_ensure_response($ticket);
    }
    
    /**
     * Update ticket
     */
    public function update_ticket($request) {
        $user_id = get_current_user_id();
        $ticket_id = $request->get_param('id');
        
        // Verify ticket belongs to user
        $ticket = UST_Database::get_ticket($ticket_id, $user_id);
        
        if (!$ticket) {
            return new WP_Error('ticket_not_found', 'Ticket not found', array('status' => 404));
        }
        
        $data = array();
        
        if ($request->has_param('status')) {
            $data['status'] = $request->get_param('status');
        }
        
        $success = UST_Database::update_ticket($ticket_id, $data, $user_id);
        
        if ($success) {
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'Ticket updated successfully'
            ));
        }
        
        return new WP_Error('update_failed', 'Failed to update ticket', array('status' => 500));
    }
    
    /**
     * Delete ticket
     */
    public function delete_ticket($request) {
        $user_id = get_current_user_id();
        $ticket_id = $request->get_param('id');
        
        // Verify ticket belongs to user
        $ticket = UST_Database::get_ticket($ticket_id, $user_id);
        
        if (!$ticket) {
            return new WP_Error('ticket_not_found', 'Ticket not found', array('status' => 404));
        }
        
        $success = UST_Database::delete_ticket($ticket_id, $user_id);
        
        if ($success) {
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'Ticket deleted successfully'
            ));
        }
        
        return new WP_Error('delete_failed', 'Failed to delete ticket', array('status' => 500));
    }
    
    /**
     * Get ticket replies
     */
    public function get_replies($request) {
        $user_id = get_current_user_id();
        $ticket_id = $request->get_param('id');
        
        // Verify ticket belongs to user
        $ticket = UST_Database::get_ticket($ticket_id, $user_id);
        
        if (!$ticket) {
            return new WP_Error('ticket_not_found', 'Ticket not found', array('status' => 404));
        }
        
        $replies = UST_Database::get_ticket_replies($ticket_id);
        
        // Enrich replies with user data
        foreach ($replies as &$reply) {
            $user = get_userdata($reply['user_id']);
            $reply['user_name'] = $user ? $user->display_name : 'Unknown';
        }
        
        return rest_ensure_response($replies);
    }
    
    /**
     * Create ticket reply
     */
    public function create_reply($request) {
        $user_id = get_current_user_id();
        $ticket_id = $request->get_param('id');
        
        // Verify ticket belongs to user
        $ticket = UST_Database::get_ticket($ticket_id, $user_id);
        
        if (!$ticket) {
            return new WP_Error('ticket_not_found', 'Ticket not found', array('status' => 404));
        }
        
        $data = array(
            'ticket_id' => $ticket_id,
            'user_id' => $user_id,
            'message' => $request->get_param('message'),
            'is_admin_reply' => current_user_can('manage_options') ? 1 : 0
        );
        
        $reply_id = UST_Database::create_reply($data);
        
        if ($reply_id) {
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'Reply added successfully',
                'reply_id' => $reply_id
            ));
        }
        
        return new WP_Error('reply_failed', 'Failed to add reply', array('status' => 500));
    }
    
    /**
     * Get ticket statistics
     */
    public function get_stats($request) {
        $user_id = get_current_user_id();
        
        $stats = array(
            'total' => UST_Database::get_ticket_count($user_id),
            'open' => UST_Database::get_ticket_count($user_id, 'open'),
            'in_progress' => UST_Database::get_ticket_count($user_id, 'in_progress'),
            'closed' => UST_Database::get_ticket_count($user_id, 'closed')
        );
        
        return rest_ensure_response($stats);
    }
}
