<?php
/**
 * Plugin Name: LTA Settings Sync
 * Plugin URI: https://lta.com.vn
 * Description: Đồng bộ cài đặt hệ thống từ LTA Next.js Application
 * Version: 1.0.1
 * Author: LTA Team
 * Author URI: https://lta.com.vn
 * License: GPL v2 or later
 * Text Domain: lta-settings-sync
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class LTA_Settings_Sync {
    
    private $api_key = '';
    private $settings_option = 'lta_system_settings';
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('rest_api_init', array($this, 'register_api_routes'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
    }
    
    public function init() {
        // Generate API key if not exists
        $this->api_key = get_option('lta_api_key', '');
        if (empty($this->api_key)) {
            $this->api_key = $this->generate_api_key();
            update_option('lta_api_key', $this->api_key);
        }
    }
    
    private function generate_api_key() {
        return 'lta_' . wp_generate_password(32, false);
    }
    
    public function register_api_routes() {
        register_rest_route('lta-settings/v1', '/save', array(
            'methods' => 'POST',
            'callback' => array($this, 'api_save_settings'),
            'permission_callback' => array($this, 'check_api_permission'),
        ));
        
        register_rest_route('lta-settings/v1', '/get', array(
            'methods' => 'GET',
            'callback' => array($this, 'api_get_settings'),
            'permission_callback' => array($this, 'check_api_permission'),
        ));
    }
    
    public function check_api_permission($request) {
        $api_key = $request->get_header('X-API-Key');
        $auth_header = $request->get_header('Authorization');
        
        // Check API key
        if ($api_key === $this->api_key) {
            return true;
        }
        
        // Check Basic Auth
        if ($auth_header && strpos($auth_header, 'Basic ') === 0) {
            $credentials = base64_decode(substr($auth_header, 6));
            list($username, $password) = explode(':', $credentials, 2);
            
            $user = wp_authenticate_application_password(null, $username, $password);
            if (!is_wp_error($user)) {
                return true;
            }
        }
        
        return false;
    }
    
    public function api_save_settings($request) {
        $params = $request->get_params();
        
        if (empty($params)) {
            return new WP_Error('no_data', 'No settings data provided', array('status' => 400));
        }
        
        // Sanitize and validate settings
        $settings = $this->sanitize_settings($params);
        
        // Save settings
        $result = update_option($this->settings_option, $settings);
        
        if ($result) {
            return array(
                'success' => true,
                'message' => 'Settings saved successfully',
                'settings' => $settings,
                'timestamp' => current_time('mysql')
            );
        } else {
            return new WP_Error('save_failed', 'Failed to save settings', array('status' => 500));
        }
    }
    
    public function api_get_settings($request) {
        $settings = get_option($this->settings_option, array());
        
        if (empty($settings)) {
            // Return default settings if none exist
            $settings = $this->get_default_settings();
        }
        
        return array(
            'success' => true,
            'settings' => $settings,
            'timestamp' => current_time('mysql')
        );
    }
    
    private function sanitize_settings($data) {
        $sanitized = array();
        
        // General Settings
        $sanitized['siteName'] = sanitize_text_field($data['siteName'] ?? '');
        $sanitized['siteDescription'] = sanitize_textarea_field($data['siteDescription'] ?? '');
        $sanitized['siteUrl'] = esc_url_raw($data['siteUrl'] ?? '');
        $sanitized['maintenanceMode'] = (bool)($data['maintenanceMode'] ?? false);
        
        // Email Settings
        $sanitized['smtpHost'] = sanitize_text_field($data['smtpHost'] ?? '');
        $sanitized['smtpPort'] = sanitize_text_field($data['smtpPort'] ?? '');
        $sanitized['smtpUser'] = sanitize_email($data['smtpUser'] ?? '');
        $sanitized['smtpPass'] = sanitize_text_field($data['smtpPass'] ?? '');
        
        // Security Settings
        $sanitized['twoFactorAuth'] = (bool)($data['twoFactorAuth'] ?? false);
        $sanitized['sessionTimeout'] = intval($data['sessionTimeout'] ?? 30);
        $sanitized['passwordPolicy'] = (bool)($data['passwordPolicy'] ?? true);
        $sanitized['loginAttempts'] = intval($data['loginAttempts'] ?? 5);
        $sanitized['maxPasswordAge'] = intval($data['maxPasswordAge'] ?? 90);
        $sanitized['requireSpecialChars'] = (bool)($data['requireSpecialChars'] ?? true);
        $sanitized['lockoutDuration'] = intval($data['lockoutDuration'] ?? 15);
        $sanitized['enableAuditLog'] = (bool)($data['enableAuditLog'] ?? true);
        $sanitized['ipWhitelist'] = sanitize_textarea_field($data['ipWhitelist'] ?? '');
        $sanitized['sessionConcurrency'] = intval($data['sessionConcurrency'] ?? 1);
        
        // Notification Settings
        $sanitized['emailNotifications'] = (bool)($data['emailNotifications'] ?? true);
        $sanitized['pushNotifications'] = (bool)($data['pushNotifications'] ?? false);
        $sanitized['newsAlerts'] = (bool)($data['newsAlerts'] ?? true);
        $sanitized['systemAlerts'] = (bool)($data['systemAlerts'] ?? true);
        
        // WordPress Settings
        $sanitized['wordpressSiteUrl'] = esc_url_raw($data['wordpressSiteUrl'] ?? '');
        $sanitized['wordpressUsername'] = sanitize_text_field($data['wordpressUsername'] ?? '');
        $sanitized['wordpressApplicationPassword'] = sanitize_text_field($data['wordpressApplicationPassword'] ?? '');
        $sanitized['wordpressAutoPublish'] = (bool)($data['wordpressAutoPublish'] ?? false);
        $sanitized['wordpressDefaultCategory'] = sanitize_text_field($data['wordpressDefaultCategory'] ?? '');
        $sanitized['wordpressDefaultTags'] = is_array($data['wordpressDefaultTags'] ?? []) ? 
            array_map('sanitize_text_field', $data['wordpressDefaultTags']) : [];
        $sanitized['wordpressFeaturedImageEnabled'] = (bool)($data['wordpressFeaturedImageEnabled'] ?? true);
        $sanitized['wordpressExcerptLength'] = intval($data['wordpressExcerptLength'] ?? 150);
        $sanitized['wordpressStatus'] = in_array($data['wordpressStatus'] ?? 'draft', ['draft', 'publish', 'private']) ? 
            $data['wordpressStatus'] : 'draft';
        
        // Contact / Google Apps Script
        $sanitized['googleAppsScriptUrl'] = esc_url_raw($data['googleAppsScriptUrl'] ?? '');
        $sanitized['contactRequestTimeoutMs'] = intval($data['contactRequestTimeoutMs'] ?? 10000);
        
        // Metadata
        $sanitized['lastUpdated'] = current_time('mysql');
        $sanitized['updatedBy'] = 'lta_sync';
        
        return $sanitized;
    }
    
    private function get_default_settings() {
        return array(
            'siteName' => 'LTA - Logistics Technology Application',
            'siteDescription' => 'Ứng dụng công nghệ logistics hàng đầu Việt Nam',
            'siteUrl' => 'https://lta.com.vn',
            'maintenanceMode' => false,
            'smtpHost' => 'smtp.gmail.com',
            'smtpPort' => '587',
            'smtpUser' => 'noreply@lta.com.vn',
            'smtpPass' => '',
            'twoFactorAuth' => false,
            'sessionTimeout' => 30,
            'passwordPolicy' => true,
            'loginAttempts' => 5,
            'maxPasswordAge' => 90,
            'requireSpecialChars' => true,
            'lockoutDuration' => 15,
            'enableAuditLog' => true,
            'ipWhitelist' => '',
            'sessionConcurrency' => 1,
            'emailNotifications' => true,
            'pushNotifications' => false,
            'newsAlerts' => true,
            'systemAlerts' => true,
            'wordpressSiteUrl' => 'https://wp2.ltacv.com',
            'wordpressUsername' => '',
            'wordpressApplicationPassword' => '',
            'wordpressAutoPublish' => false,
            'wordpressDefaultCategory' => '',
            'wordpressDefaultTags' => [],
            'wordpressFeaturedImageEnabled' => true,
            'wordpressExcerptLength' => 150,
            'wordpressStatus' => 'draft',
            'googleAppsScriptUrl' => '',
            'contactRequestTimeoutMs' => 10000,
            'lastUpdated' => current_time('mysql'),
            'updatedBy' => 'default'
        );
    }
    
    public function add_admin_menu() {
        add_options_page(
            'LTA Settings Sync',
            'LTA Settings',
            'manage_options',
            'lta-settings-sync',
            array($this, 'admin_page')
        );
    }
    
    public function admin_page() {
        $settings = get_option($this->settings_option, $this->get_default_settings());
        $api_key = get_option('lta_api_key', '');
        ?>
        <div class="wrap">
            <h1>LTA Settings Sync</h1>
            
            <div class="card">
                <h2>API Configuration</h2>
                <p><strong>API Key:</strong> <code><?php echo esc_html($api_key); ?></code></p>
                <p><strong>Endpoint:</strong> <code><?php echo esc_url(rest_url('lta-settings/v1/')); ?></code></p>
            </div>
            
            <div class="card">
                <h2>Current Settings</h2>
                <table class="widefat">
                    <thead>
                        <tr>
                            <th>Setting</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($settings as $key => $value): ?>
                        <tr>
                            <td><strong><?php echo esc_html($key); ?></strong></td>
                            <td>
                                <?php 
                                if (is_bool($value)) {
                                    echo $value ? 'Yes' : 'No';
                                } elseif (is_array($value)) {
                                    echo esc_html(implode(', ', $value));
                                } else {
                                    echo esc_html($value);
                                }
                                ?>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
        <?php
    }
}

// Initialize the plugin
new LTA_Settings_Sync();

// Activation hook
register_activation_hook(__FILE__, function() {
    // Create default settings
    $plugin = new LTA_Settings_Sync();
    $default_settings = $plugin->get_default_settings();
    update_option('lta_system_settings', $default_settings);
});

// Deactivation hook
register_deactivation_hook(__FILE__, function() {
    // Clean up if needed
});
