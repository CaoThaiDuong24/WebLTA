<?php
/**
 * Plugin Name: LTA Applicants
 * Description: Lưu trữ thông tin ứng viên từ website LTA vào bảng riêng trong WordPress và cung cấp AJAX API.
 * Version: 1.0.0
 * Author: LTA Team
 */

if (!defined('ABSPATH')) { exit; }

define('LTA_APPLICANTS_VERSION', '1.0.0');
define('LTA_APPLICANTS_TABLE', 'lta_applicants');

class LTA_Applicants_Plugin {
    public function __construct() {
        add_action('init', array($this, 'init'));
        // Applicants actions
        add_action('wp_ajax_lta_submit_applicant', array($this, 'ajax_submit_applicant'));
        add_action('wp_ajax_nopriv_lta_submit_applicant', array($this, 'ajax_submit_applicant'));
        add_action('wp_ajax_lta_get_applicants', array($this, 'ajax_get_applicants'));
        add_action('wp_ajax_nopriv_lta_get_applicants', array($this, 'ajax_get_applicants'));
        
        // Test endpoint
        add_action('wp_ajax_lta_test', array($this, 'ajax_test'));
        add_action('wp_ajax_nopriv_lta_test', array($this, 'ajax_test'));


        register_activation_hook(__FILE__, array($this, 'activate'));
    }

    public function init() {
        $this->create_table();
    }

    public function activate() {
        $this->create_table();
    }

    private function create_table() {
        global $wpdb;
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        $charset = $wpdb->get_charset_collate();
        
        // Create applicants table
        $applicants_table = $wpdb->prefix . LTA_APPLICANTS_TABLE;
        $applicants_sql = "CREATE TABLE IF NOT EXISTS $applicants_table (
            id varchar(50) NOT NULL,
            full_name varchar(255) NOT NULL,
            email varchar(255) NOT NULL,
            phone varchar(100) NOT NULL,
            position varchar(255) NOT NULL,
            linkedin_github text NULL,
            ai_use_case longtext NULL,
            experience varchar(255) NULL,
            additional_roles longtext NULL,
            notes longtext NULL,
            resume_url text NULL,
            created_at datetime NOT NULL,
            PRIMARY KEY (id),
            KEY position (position),
            KEY email (email)
        ) $charset;";
        dbDelta($applicants_sql);
        

    }

    private function verify_api_key() {
        // Use default API key for recruitment
        $incoming = isset($_REQUEST['api_key']) ? sanitize_text_field($_REQUEST['api_key']) : '';
        $default_key = 'lta_recruitment_2024';
        return ($incoming === $default_key);
    }

    public function ajax_submit_applicant() {
        if (!$this->verify_api_key()) {
            wp_die(json_encode(['success' => false, 'message' => 'API key không hợp lệ']));
        }

        $src = isset($_POST['applicant']) ? (array) $_POST['applicant'] : [];
        if (empty($src)) {
            wp_die(json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ']));
        }

        $record = array(
            'id' => sanitize_text_field($src['id'] ?? ''),
            'full_name' => sanitize_text_field($src['fullName'] ?? ''),
            'email' => sanitize_email($src['email'] ?? ''),
            'phone' => sanitize_text_field($src['phone'] ?? ''),
            'position' => sanitize_text_field($src['position'] ?? ''),
            'linkedin_github' => esc_url_raw($src['linkedinGithub'] ?? ''),
            'ai_use_case' => wp_kses_post($src['aiUseCase'] ?? ''),
            'experience' => sanitize_text_field($src['experience'] ?? ''),
            'additional_roles' => maybe_serialize(isset($src['additionalRoles']) ? (is_array($src['additionalRoles']) ? $src['additionalRoles'] : explode(',', $src['additionalRoles'])) : []),
            'notes' => wp_kses_post($src['notes'] ?? ''),
            'resume_url' => esc_url_raw($src['resumeUrl'] ?? ''),
            'created_at' => sanitize_text_field($src['createdAt'] ?? current_time('mysql')),
        );

        if (empty($record['id'])) {
            $record['id'] = (string) (time() . rand(100,999));
        }

        if (empty($record['full_name']) || empty($record['email']) || empty($record['phone']) || empty($record['position'])) {
            wp_die(json_encode(['success' => false, 'message' => 'Thiếu thông tin bắt buộc']));
        }

        global $wpdb;
        $table = $wpdb->prefix . LTA_APPLICANTS_TABLE;
        $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table WHERE id = %s", $record['id']));
        if ($exists) {
            $res = $wpdb->update($table, $record, array('id' => $record['id']));
        } else {
            $res = $wpdb->insert($table, $record);
        }
        if ($res === false) {
            wp_die(json_encode(['success' => false, 'message' => 'Lỗi lưu dữ liệu: ' . $wpdb->last_error]));
        }
        wp_die(json_encode(['success' => true, 'message' => 'Đã lưu ứng viên', 'id' => $record['id']]));
    }

    public function ajax_get_applicants() {
        if (!$this->verify_api_key()) {
            wp_die(json_encode(['success' => false, 'message' => 'API key không hợp lệ']));
        }

        global $wpdb;
        $table = $wpdb->prefix . LTA_APPLICANTS_TABLE;
        $limit = isset($_POST['limit']) ? intval($_POST['limit']) : 200;
        $items = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table ORDER BY created_at DESC LIMIT %d", $limit), ARRAY_A);
        foreach ($items as &$it) {
            $it['additional_roles'] = maybe_unserialize($it['additional_roles']);
        }
        wp_die(json_encode(['success' => true, 'data' => $items]));
    }
    
    // Test endpoint to check if plugin is working
    public function ajax_test() {
        if (!$this->verify_api_key()) {
            wp_die(json_encode(['success' => false, 'message' => 'API key không hợp lệ']));
        }
        
        global $wpdb;
        $table = $wpdb->prefix . LTA_APPLICANTS_TABLE;
        $table_exists = $wpdb->get_var("SHOW TABLES LIKE '$table'") === $table;
        
        wp_die(json_encode([
            'success' => true, 
            'message' => 'Plugin hoạt động bình thường',
            'table_exists' => $table_exists,
            'table_name' => $table,
            'wp_prefix' => $wpdb->prefix,
            'php_version' => PHP_VERSION,
            'wordpress_version' => get_bloginfo('version')
        ]));
    }
}

new LTA_Applicants_Plugin();


