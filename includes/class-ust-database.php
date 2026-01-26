<?php
/**
 * Database operations class
 */

if (!defined('WPINC')) {
    die;
}

class UST_Database {
    
    /**
     * Get tickets for a user
     */
    public static function get_user_tickets($user_id, $args = array()) {
        global $wpdb;
        
        $defaults = array(
            'status' => '',
            'orderby' => 'created_at',
            'order' => 'DESC',
            'limit' => 50,
            'offset' => 0
        );
        
        $args = wp_parse_args($args, $defaults);
        
        $table_name = $wpdb->prefix . 'ust_tickets';
        
        $where = $wpdb->prepare("WHERE user_id = %d", $user_id);
        
        if (!empty($args['status'])) {
            $where .= $wpdb->prepare(" AND status = %s", $args['status']);
        }
        
        $orderby = sanitize_sql_orderby($args['orderby'] . ' ' . $args['order']);
        
        $query = "SELECT * FROM $table_name $where ORDER BY $orderby LIMIT %d OFFSET %d";
        
        $results = $wpdb->get_results(
            $wpdb->prepare($query, $args['limit'], $args['offset']),
            ARRAY_A
        );
        
        return $results;
    }
    
    /**
     * Get single ticket
     */
    public static function get_ticket($ticket_id, $user_id = null) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'ust_tickets';
        
        if ($user_id !== null) {
            $ticket = $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT * FROM $table_name WHERE id = %d AND user_id = %d",
                    $ticket_id,
                    $user_id
                ),
                ARRAY_A
            );
        } else {
            $ticket = $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT * FROM $table_name WHERE id = %d",
                    $ticket_id
                ),
                ARRAY_A
            );
        }
        
        return $ticket;
    }
    
    /**
     * Create a new ticket
     */
    public static function create_ticket($data) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'ust_tickets';
        
        $insert_data = array(
            'user_id' => absint($data['user_id']),
            'subject' => sanitize_text_field($data['subject']),
            'message' => wp_kses_post($data['message']),
            'status' => isset($data['status']) ? sanitize_text_field($data['status']) : 'open',
            'priority' => isset($data['priority']) ? sanitize_text_field($data['priority']) : 'medium',
            'created_at' => current_time('mysql'),
            'updated_at' => current_time('mysql')
        );
        
        $result = $wpdb->insert($table_name, $insert_data);
        
        if ($result) {
            return $wpdb->insert_id;
        }
        
        return false;
    }
    
    /**
     * Update ticket
     */
    public static function update_ticket($ticket_id, $data, $user_id = null) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'ust_tickets';
        
        $update_data = array();
        
        if (isset($data['subject'])) {
            $update_data['subject'] = sanitize_text_field($data['subject']);
        }
        
        if (isset($data['message'])) {
            $update_data['message'] = wp_kses_post($data['message']);
        }
        
        if (isset($data['status'])) {
            $update_data['status'] = sanitize_text_field($data['status']);
        }
        
        if (isset($data['priority'])) {
            $update_data['priority'] = sanitize_text_field($data['priority']);
        }
        
        $update_data['updated_at'] = current_time('mysql');
        
        $where = array('id' => absint($ticket_id));
        
        if ($user_id !== null) {
            $where['user_id'] = absint($user_id);
        }
        
        $result = $wpdb->update($table_name, $update_data, $where);
        
        return $result !== false;
    }
    
    /**
     * Delete ticket
     */
    public static function delete_ticket($ticket_id, $user_id = null) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'ust_tickets';
        
        $where = array('id' => absint($ticket_id));
        
        if ($user_id !== null) {
            $where['user_id'] = absint($user_id);
        }
        
        $result = $wpdb->delete($table_name, $where);
        
        // Also delete replies
        if ($result) {
            self::delete_ticket_replies($ticket_id);
        }
        
        return $result !== false;
    }
    
    /**
     * Get ticket replies
     */
    public static function get_ticket_replies($ticket_id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'ust_ticket_replies';
        
        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM $table_name WHERE ticket_id = %d ORDER BY created_at ASC",
                $ticket_id
            ),
            ARRAY_A
        );
        
        return $results;
    }
    
    /**
     * Create ticket reply
     */
    public static function create_reply($data) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'ust_ticket_replies';
        
        $insert_data = array(
            'ticket_id' => absint($data['ticket_id']),
            'user_id' => absint($data['user_id']),
            'message' => wp_kses_post($data['message']),
            'is_admin_reply' => isset($data['is_admin_reply']) ? absint($data['is_admin_reply']) : 0,
            'created_at' => current_time('mysql')
        );
        
        $result = $wpdb->insert($table_name, $insert_data);
        
        if ($result) {
            // Update ticket updated_at
            $tickets_table = $wpdb->prefix . 'ust_tickets';
            $wpdb->update(
                $tickets_table,
                array('updated_at' => current_time('mysql')),
                array('id' => $insert_data['ticket_id'])
            );
            
            return $wpdb->insert_id;
        }
        
        return false;
    }
    
    /**
     * Delete ticket replies
     */
    private static function delete_ticket_replies($ticket_id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'ust_ticket_replies';
        
        return $wpdb->delete($table_name, array('ticket_id' => absint($ticket_id)));
    }
    
    /**
     * Get ticket count by status
     */
    public static function get_ticket_count($user_id, $status = null) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'ust_tickets';
        
        if ($status) {
            $count = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(*) FROM $table_name WHERE user_id = %d AND status = %s",
                    $user_id,
                    $status
                )
            );
        } else {
            $count = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(*) FROM $table_name WHERE user_id = %d",
                    $user_id
                )
            );
        }
        
        return absint($count);
    }
}
