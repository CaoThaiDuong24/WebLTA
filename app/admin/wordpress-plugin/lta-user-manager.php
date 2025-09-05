<?php
/**
 * Plugin Name: LTA User Manager
 * Description: REST API endpoint for creating WordPress users from external applications
 * Version: 1.3.0
 * Author: LTA Team
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Simple test endpoint
function lta_test_endpoint($request) {
    return array(
        'success' => true,
        'message' => 'LTA Plugin is working!',
        'timestamp' => current_time('mysql'),
        'version' => '1.3.0'
    );
}

// Simple authentication function
function lta_authenticate_user($request) {
    $params = $request->get_params();
    
    // Validate required fields
    if (empty($params['username']) || empty($params['password'])) {
        return new WP_Error('missing_fields', 'Username and password are required', array('status' => 400));
    }
    
    $username = sanitize_user($params['username']);
    $password = $params['password'];
    
    // Try to authenticate user
    $user = wp_authenticate($username, $password);
    
    if (is_wp_error($user)) {
        return new WP_Error('authentication_failed', 'Invalid username or password', array('status' => 401));
    }
    
    // Get user roles
    $user_roles = $user->roles;
    $primary_role = !empty($user_roles) ? $user_roles[0] : 'subscriber';
    
    return array(
        'success' => true,
        'user' => array(
            'ID' => $user->ID,
            'user_login' => $user->user_login,
            'user_email' => $user->user_email,
            'display_name' => $user->display_name,
            'role' => $primary_role
        ),
        'message' => 'Authentication successful'
    );
}

// Simple create user function
function lta_create_user($request) {
    $params = $request->get_params();
    
    // Validate required fields
    if (empty($params['username']) || empty($params['email']) || empty($params['password'])) {
        return new WP_Error('missing_fields', 'Username, email, and password are required', array('status' => 400));
    }
    
    // Check if user already exists
    if (username_exists($params['username'])) {
        return new WP_Error('user_exists', 'Username already exists', array('status' => 409));
    }
    
    if (email_exists($params['email'])) {
        return new WP_Error('email_exists', 'Email already exists', array('status' => 409));
    }
    

    
    // Set timezone to Vietnam (UTC+7)
    date_default_timezone_set('Asia/Ho_Chi_Minh');
    
    // Create user
    $user_id = wp_create_user(
        $params['username'],
        $params['password'],
        $params['email']
    );
    
    if (is_wp_error($user_id)) {
        return new WP_Error('user_creation_failed', $user_id->get_error_message(), array('status' => 500));
    }
    
    // Update user meta
    $user_data = array(
        'ID' => $user_id,
        'display_name' => isset($params['name']) ? $params['name'] : $params['username'],
        'role' => isset($params['role']) ? $params['role'] : 'subscriber'
    );
    
    wp_update_user($user_data);
    
    return array(
        'success' => true,
        'userId' => $user_id,
        'username' => $params['username'],
        'email' => $params['email'],
        'role' => isset($params['role']) ? $params['role'] : 'subscriber'
    );
}

// Simple get users function
function lta_get_users($request) {
    $users = get_users(array(
        'orderby' => 'ID',
        'order' => 'ASC'
    ));
    
    $users_data = array();
    
    foreach ($users as $user) {
        $user_roles = $user->roles;
        $primary_role = !empty($user_roles) ? $user_roles[0] : 'subscriber';
        // Default to active if meta not set
        $raw_active = get_user_meta($user->ID, 'is_active', true);
        if ($raw_active === '' || $raw_active === null) {
            $is_active = true;
        } else if ($raw_active === '0' || $raw_active === 0) {
            $is_active = false;
        } else {
            $is_active = filter_var($raw_active, FILTER_VALIDATE_BOOLEAN);
        }
        
        $users_data[] = array(
            'ID' => $user->ID,
            'user_login' => $user->user_login,
            'user_email' => $user->user_email,
            'display_name' => $user->display_name,
            'user_registered' => $user->user_registered,
            'role' => $primary_role,
            'user_status' => $user->user_status,
            'meta' => array(
                'is_active' => (bool)$is_active
            )
        );
    }
    
    return array(
        'success' => true,
        'users' => $users_data,
        'count' => count($users_data)
    );
}

// Update user status (active/inactive)
function lta_update_user($request) {
    $id = intval($request['id']);
    if (!$id) {
        return new WP_Error('invalid_user', 'User ID không hợp lệ', array('status' => 400));
    }

    $params = $request->get_params();
    $meta = isset($params['meta']) ? $params['meta'] : array();
    $updated = false;

    if (isset($meta['is_active'])) {
        $val = $meta['is_active'] ? '1' : '0';
        update_user_meta($id, 'is_active', $val);
        $updated = true;
    }

    if (!$updated) {
        return new WP_Error('nothing_to_update', 'Không có trường hợp lệ để cập nhật', array('status' => 400));
    }

    return array(
        'success' => true,
        'message' => 'Đã cập nhật trạng thái người dùng',
        'id' => $id,
        'meta' => array('is_active' => get_user_meta($id, 'is_active', true) === '1')
    );
}

// Delete user
function lta_delete_user($request) {
    $id = intval($request['id']);
    if (!$id) {
        return new WP_Error('invalid_user', 'User ID không hợp lệ', array('status' => 400));
    }

    if (!get_userdata($id)) {
        return new WP_Error('not_found', 'Không tìm thấy người dùng', array('status' => 404));
    }

    $result = wp_delete_user($id);
    if (!$result) {
        return new WP_Error('delete_failed', 'Xóa người dùng thất bại', array('status' => 500));
    }

    return array(
        'success' => true,
        'message' => 'Đã xóa người dùng',
        'id' => $id
    );
}

// Register REST API endpoints
add_action('rest_api_init', function () {
    // Test endpoint
    register_rest_route('lta/v1', '/test', array(
        'methods' => 'GET',
        'callback' => 'lta_test_endpoint',
        'permission_callback' => '__return_true'
    ));
    
    // Authentication endpoint
    register_rest_route('lta/v1', '/auth', array(
        'methods' => 'POST',
        'callback' => 'lta_authenticate_user',
        'permission_callback' => '__return_true'
    ));
    
    // Create user endpoint
    register_rest_route('lta/v1', '/create-user', array(
        'methods' => 'POST',
        'callback' => 'lta_create_user',
        'permission_callback' => function() {
            return current_user_can('manage_options') || current_user_can('edit_users');
        }
    ));
    
    // Get users endpoint
    register_rest_route('lta/v1', '/users', array(
        'methods' => 'GET',
        'callback' => 'lta_get_users',
        'permission_callback' => function() {
            return current_user_can('manage_options') || current_user_can('edit_users');
        }
    ));

    // Update user endpoint (status/meta)
    register_rest_route('lta/v1', '/users/(?P<id>\d+)', array(
        'methods' => 'PUT',
        'callback' => 'lta_update_user',
        'permission_callback' => function() {
            return current_user_can('manage_options') || current_user_can('edit_users');
        }
    ));

    // Delete user endpoint
    register_rest_route('lta/v1', '/users/(?P<id>\d+)', array(
        'methods' => 'DELETE',
        'callback' => 'lta_delete_user',
        'permission_callback' => function() {
            return current_user_can('manage_options') || current_user_can('delete_users');
        }
    ));
});

// Add activation hook to flush rewrite rules
register_activation_hook(__FILE__, function() {
    flush_rewrite_rules();
});

// Add deactivation hook
register_deactivation_hook(__FILE__, function() {
    flush_rewrite_rules();
});
