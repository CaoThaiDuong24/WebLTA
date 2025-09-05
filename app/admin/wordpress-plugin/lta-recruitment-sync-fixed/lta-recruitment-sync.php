<?php
/**
 * Plugin Name: LTA Recruitment Sync
 * Description: Đồng bộ thông tin tuyển dụng từ hệ thống LTA với WordPress thông qua API và webhook.
 * Version: 1.0.0
 * Author: LTA Team
 * Text Domain: lta-recruitment-sync
 */

if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('LTA_RECRUITMENT_SYNC_VERSION', '1.0.0');
define('LTA_RECRUITMENT_SYNC_PLUGIN_URL', plugin_dir_url(__FILE__));
define('LTA_RECRUITMENT_SYNC_PLUGIN_PATH', plugin_dir_path(__FILE__));

// Database table name
define('LTA_RECRUITMENT_TABLE', 'lta_recruitment');

class LTA_Recruitment_Sync {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('wp_ajax_lta_sync_recruitment', array($this, 'ajax_sync_recruitment'));
        add_action('wp_ajax_nopriv_lta_sync_recruitment', array($this, 'ajax_sync_recruitment'));
        add_action('wp_ajax_lta_get_recruitment', array($this, 'ajax_get_recruitment'));
        add_action('wp_ajax_nopriv_lta_get_recruitment', array($this, 'ajax_get_recruitment'));
        add_action('wp_ajax_lta_delete_recruitment', array($this, 'ajax_delete_recruitment'));
        add_action('wp_ajax_nopriv_lta_delete_recruitment', array($this, 'ajax_delete_recruitment'));
        
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    public function init() {
        // Create database table if not exists
        $this->create_table();
    }
    
    public function activate() {
        $this->create_table();
        $this->set_default_options();
    }
    
    public function deactivate() {
        // Clean up if needed
    }
    
    private function create_table() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . LTA_RECRUITMENT_TABLE;
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id varchar(50) NOT NULL,
            title text NOT NULL,
            position varchar(255) NOT NULL,
            location varchar(255) NOT NULL,
            salary varchar(255) NOT NULL,
            type varchar(50) NOT NULL,
            status varchar(50) NOT NULL DEFAULT 'active',
            description longtext NOT NULL,
            requirements longtext NOT NULL,
            benefits longtext NOT NULL,
            experience varchar(255) NOT NULL,
            education varchar(255) NOT NULL,
            deadline datetime NOT NULL,
            created_at datetime NOT NULL,
            updated_at datetime NOT NULL,
            wp_post_id bigint(20) DEFAULT NULL,
            sync_status varchar(50) DEFAULT 'pending',
            last_sync datetime DEFAULT NULL,
            PRIMARY KEY (id),
            KEY status (status),
            KEY type (type),
            KEY location (location),
            KEY sync_status (sync_status)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    private function set_default_options() {
        add_option('lta_recruitment_sync_api_key', '');
        add_option('lta_recruitment_sync_webhook_url', '');
        add_option('lta_recruitment_sync_auto_create_posts', '1');
        add_option('lta_recruitment_sync_post_category', '');
        add_option('lta_recruitment_sync_post_status', 'draft');
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'LTA Recruitment Sync',
            'LTA Recruitment',
            'manage_options',
            'lta-recruitment-sync',
            array($this, 'admin_page'),
            'dashicons-businessman',
            81
        );
    }
    
    public function admin_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        $message = '';
        if (isset($_POST['lta_save_settings'])) {
            check_admin_referer('lta_recruitment_sync_save');
            
            $api_key = sanitize_text_field($_POST['api_key']);
            $webhook_url = esc_url_raw($_POST['webhook_url']);
            $auto_create_posts = isset($_POST['auto_create_posts']) ? '1' : '0';
            $post_category = sanitize_text_field($_POST['post_category']);
            $post_status = sanitize_text_field($_POST['post_status']);
            
            update_option('lta_recruitment_sync_api_key', $api_key);
            update_option('lta_recruitment_sync_webhook_url', $webhook_url);
            update_option('lta_recruitment_sync_auto_create_posts', $auto_create_posts);
            update_option('lta_recruitment_sync_post_category', $post_category);
            update_option('lta_recruitment_sync_post_status', $post_status);
            
            $message = 'Cập nhật cấu hình thành công!';
        }
        
        $api_key = get_option('lta_recruitment_sync_api_key', '');
        $webhook_url = get_option('lta_recruitment_sync_webhook_url', '');
        $auto_create_posts = get_option('lta_recruitment_sync_auto_create_posts', '1');
        $post_category = get_option('lta_recruitment_sync_post_category', '');
        $post_status = get_option('lta_recruitment_sync_post_status', 'draft');
        
        $this->render_admin_page($message, $api_key, $webhook_url, $auto_create_posts, $post_category, $post_status);
    }
    
    private function render_admin_page($message, $api_key, $webhook_url, $auto_create_posts, $post_category, $post_status) {
        ?>
        <div class="wrap">
            <h1>LTA Recruitment Sync - Cấu hình</h1>
            
            <?php if (!empty($message)): ?>
                <div class="notice notice-success is-dismissible">
                    <p><?php echo esc_html($message); ?></p>
                </div>
            <?php endif; ?>
            
            <div class="card">
                <h2>Cấu hình đồng bộ</h2>
                <form method="post" action="">
                    <?php wp_nonce_field('lta_recruitment_sync_save'); ?>
                    
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="api_key">API Key</label>
                            </th>
                            <td>
                                <input type="text" id="api_key" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" />
                                <p class="description">API key để xác thực khi đồng bộ dữ liệu từ hệ thống LTA.</p>
                            </td>
                        </tr>
                        
                        <tr>
                            <th scope="row">
                                <label for="webhook_url">Webhook URL</label>
                            </th>
                            <td>
                                <input type="url" id="webhook_url" name="webhook_url" value="<?php echo esc_attr($webhook_url); ?>" class="regular-text" />
                                <p class="description">URL webhook để nhận thông báo từ hệ thống LTA (tùy chọn).</p>
                            </td>
                        </tr>
                        
                        <tr>
                            <th scope="row">
                                <label for="auto_create_posts">Tự động tạo bài viết</label>
                            </th>
                            <td>
                                <label>
                                    <input type="checkbox" id="auto_create_posts" name="auto_create_posts" value="1" <?php checked($auto_create_posts, '1'); ?> />
                                    Tự động tạo bài viết WordPress khi đồng bộ thông tin tuyển dụng
                                </label>
                            </td>
                        </tr>
                        
                        <tr>
                            <th scope="row">
                                <label for="post_category">Danh mục bài viết</label>
                            </th>
                            <td>
                                <select id="post_category" name="post_category">
                                    <option value="">-- Chọn danh mục --</option>
                                    <?php
                                    $categories = get_categories(array('hide_empty' => false));
                                    foreach ($categories as $category) {
                                        echo '<option value="' . esc_attr($category->slug) . '" ' . selected($post_category, $category->slug, false) . '>' . esc_html($category->name) . '</option>';
                                    }
                                    ?>
                                </select>
                                <p class="description">Danh mục mặc định cho các bài viết tuyển dụng được tạo tự động.</p>
                            </td>
                        </tr>
                        
                        <tr>
                            <th scope="row">
                                <label for="post_status">Trạng thái bài viết</label>
                            </th>
                            <td>
                                <select id="post_status" name="post_status">
                                    <option value="draft" <?php selected($post_status, 'draft'); ?>>Bản nháp</option>
                                    <option value="publish" <?php selected($post_status, 'publish'); ?>>Xuất bản</option>
                                    <option value="private" <?php selected($post_status, 'private'); ?>>Riêng tư</option>
                                </select>
                                <p class="description">Trạng thái mặc định cho các bài viết tuyển dụng được tạo tự động.</p>
                            </td>
                        </tr>
                    </table>
                    
                    <p class="submit">
                        <input type="submit" name="lta_save_settings" class="button-primary" value="Lưu cấu hình" />
                    </p>
                </form>
            </div>
            
            <div class="card">
                <h2>Thông tin API</h2>
                <p>Plugin cung cấp các endpoint AJAX sau để đồng bộ dữ liệu:</p>
                
                <h3>1. Đồng bộ thông tin tuyển dụng</h3>
                <p><strong>URL:</strong> <code><?php echo admin_url('admin-ajax.php'); ?></code></p>
                <p><strong>Action:</strong> <code>lta_sync_recruitment</code></p>
                <p><strong>Method:</strong> POST</p>
                <p><strong>Parameters:</strong></p>
                <ul>
                    <li><code>action</code>: lta_sync_recruitment</li>
                    <li><code>api_key</code>: API key đã cấu hình</li>
                    <li><code>recruitment</code>: Dữ liệu tuyển dụng (JSON)</li>
                </ul>
                
                <h3>2. Lấy thông tin tuyển dụng</h3>
                <p><strong>Action:</strong> <code>lta_get_recruitment</code></p>
                <p><strong>Method:</strong> GET</p>
                <p><strong>Parameters:</strong></p>
                <ul>
                    <li><code>action</code>: lta_get_recruitment</li>
                    <li><code>api_key</code>: API key đã cấu hình</li>
                    <li><code>id</code>: ID tuyển dụng</li>
                </ul>
                
                <h3>3. Xóa thông tin tuyển dụng</h3>
                <p><strong>Action:</strong> <code>lta_delete_recruitment</code></p>
                <p><strong>Method:</strong> POST</p>
                <p><strong>Parameters:</strong></p>
                <ul>
                    <li><code>action</code>: lta_delete_recruitment</li>
                    <li><code>api_key</code>: API key đã cấu hình</li>
                    <li><code>id</code>: ID tuyển dụng</li>
                </ul>
            </div>
            
            <div class="card">
                <h2>Shortcode</h2>
                <p>Sử dụng shortcode sau để hiển thị danh sách tuyển dụng trên trang:</p>
                <code>[lta_recruitment_list status="active" limit="10"]</code>
                
                <h3>Tham số:</h3>
                <ul>
                    <li><code>status</code>: Trạng thái tuyển dụng (active, inactive, all) - mặc định: active</li>
                    <li><code>limit</code>: Số lượng hiển thị - mặc định: 10</li>
                    <li><code>type</code>: Loại công việc (full-time, part-time, internship) - tùy chọn</li>
                    <li><code>location</code>: Địa điểm - tùy chọn</li>
                </ul>
                
                <h3>Ví dụ:</h3>
                <ul>
                    <li><code>[lta_recruitment_list]</code> - Hiển thị 10 tin tuyển dụng đang hoạt động</li>
                    <li><code>[lta_recruitment_list status="all" limit="20"]</code> - Hiển thị tất cả tin tuyển dụng (tối đa 20)</li>
                    <li><code>[lta_recruitment_list type="full-time" location="Hà Nội"]</code> - Hiển thị tin tuyển dụng full-time tại Hà Nội</li>
                </ul>
            </div>
            
            <div class="card">
                <h2>Thống kê</h2>
                <?php
                $total_count = $this->get_recruitment_count('all');
                $active_count = $this->get_recruitment_count('active');
                $inactive_count = $this->get_recruitment_count('inactive');
                ?>
                <table class="widefat">
                    <thead>
                        <tr>
                            <th>Tổng số</th>
                            <th>Đang hoạt động</th>
                            <th>Không hoạt động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><?php echo esc_html($total_count); ?></td>
                            <td><?php echo esc_html($active_count); ?></td>
                            <td><?php echo esc_html($inactive_count); ?></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="card">
                <h2>Hướng dẫn sử dụng</h2>
                <ol>
                    <li>Cấu hình API key và các tùy chọn khác ở trên</li>
                    <li>Sử dụng các endpoint AJAX để đồng bộ dữ liệu từ hệ thống LTA</li>
                    <li>Sử dụng shortcode <code>[lta_recruitment_list]</code> để hiển thị danh sách tuyển dụng</li>
                    <li>Plugin sẽ tự động tạo bảng cơ sở dữ liệu khi được kích hoạt</li>
                    <li>Dữ liệu tuyển dụng được lưu trong bảng <code><?php echo $wpdb->prefix; ?>lta_recruitment</code></li>
                </ol>
            </div>
        </div>

        <style>
        .card {
            background: #fff;
            border: 1px solid #ccd0d4;
            border-radius: 4px;
            margin-top: 20px;
            padding: 20px;
        }

        .card h2 {
            margin-top: 0;
            color: #23282d;
        }

        .form-table th {
            width: 200px;
        }

        code {
            background: #f1f1f1;
            padding: 2px 4px;
            border-radius: 3px;
        }

        .widefat {
            margin-top: 10px;
        }
        </style>
        <?php
    }
    
    public function ajax_sync_recruitment() {
        // Verify API key
        $api_key = sanitize_text_field($_POST['api_key'] ?? '');
        $stored_key = get_option('lta_recruitment_sync_api_key', '');
        
        if (empty($stored_key) || $api_key !== $stored_key) {
            wp_die(json_encode(['success' => false, 'message' => 'API key không hợp lệ']));
        }
        
        $recruitment_data = $_POST['recruitment'] ?? null;
        if (!$recruitment_data) {
            wp_die(json_encode(['success' => false, 'message' => 'Dữ liệu tuyển dụng không hợp lệ']));
        }
        
        $result = $this->sync_recruitment($recruitment_data);
        wp_die(json_encode($result));
    }
    
    public function ajax_get_recruitment() {
        $api_key = sanitize_text_field($_GET['api_key'] ?? '');
        $stored_key = get_option('lta_recruitment_sync_api_key', '');
        
        if (empty($stored_key) || $api_key !== $stored_key) {
            wp_die(json_encode(['success' => false, 'message' => 'API key không hợp lệ']));
        }
        
        $recruitment_id = sanitize_text_field($_GET['id'] ?? '');
        if (empty($recruitment_id)) {
            wp_die(json_encode(['success' => false, 'message' => 'ID tuyển dụng không hợp lệ']));
        }
        
        $recruitment = $this->get_recruitment($recruitment_id);
        if ($recruitment) {
            wp_die(json_encode(['success' => true, 'data' => $recruitment]));
        } else {
            wp_die(json_encode(['success' => false, 'message' => 'Không tìm thấy thông tin tuyển dụng']));
        }
    }
    
    public function ajax_delete_recruitment() {
        $api_key = sanitize_text_field($_POST['api_key'] ?? '');
        $stored_key = get_option('lta_recruitment_sync_api_key', '');
        
        if (empty($stored_key) || $api_key !== $stored_key) {
            wp_die(json_encode(['success' => false, 'message' => 'API key không hợp lệ']));
        }
        
        $recruitment_id = sanitize_text_field($_POST['id'] ?? '');
        if (empty($recruitment_id)) {
            wp_die(json_encode(['success' => false, 'message' => 'ID tuyển dụng không hợp lệ']));
        }
        
        $result = $this->delete_recruitment($recruitment_id);
        wp_die(json_encode($result));
    }
    
    private function sync_recruitment($data) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . LTA_RECRUITMENT_TABLE;
        
        // Sanitize and validate data
        $recruitment = array(
            'id' => sanitize_text_field($data['id']),
            'title' => sanitize_text_field($data['title']),
            'position' => sanitize_text_field($data['position']),
            'location' => sanitize_text_field($data['location']),
            'salary' => sanitize_text_field($data['salary']),
            'type' => sanitize_text_field($data['type']),
            'status' => sanitize_text_field($data['status']),
            'description' => wp_kses_post($data['description']),
            'requirements' => maybe_serialize($data['requirements']),
            'benefits' => maybe_serialize($data['benefits']),
            'experience' => sanitize_text_field($data['experience']),
            'education' => sanitize_text_field($data['education']),
            'deadline' => sanitize_text_field($data['deadline']),
            'created_at' => sanitize_text_field($data['createdAt']),
            'updated_at' => sanitize_text_field($data['updatedAt']),
            'sync_status' => 'synced',
            'last_sync' => current_time('mysql')
        );
        
        // Check if exists
        $existing = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %s", $recruitment['id']));
        
        if ($existing) {
            // Update existing
            $result = $wpdb->update(
                $table_name,
                $recruitment,
                array('id' => $recruitment['id'])
            );
        } else {
            // Insert new
            $result = $wpdb->insert($table_name, $recruitment);
        }
        
        if ($result === false) {
            return array('success' => false, 'message' => 'Lỗi khi lưu dữ liệu: ' . $wpdb->last_error);
        }
        
        // Auto create WordPress post if enabled
        if (get_option('lta_recruitment_sync_auto_create_posts', '1')) {
            $post_id = $this->create_or_update_post($recruitment);
            if ($post_id) {
                $wpdb->update(
                    $table_name,
                    array('wp_post_id' => $post_id),
                    array('id' => $recruitment['id'])
                );
            }
        }
        
        return array('success' => true, 'message' => 'Đồng bộ thành công', 'id' => $recruitment['id']);
    }
    
    private function create_or_update_post($recruitment) {
        global $wpdb;
        
        $post_data = array(
            'post_title' => $recruitment['title'],
            'post_content' => $this->format_post_content($recruitment),
            'post_status' => get_option('lta_recruitment_sync_post_status', 'draft'),
            'post_type' => 'post',
            'post_author' => get_current_user_id() ?: 1,
            'post_date' => $recruitment['created_at'],
            'post_modified' => $recruitment['updated_at']
        );
        
        // Check if post exists
        $existing_post = $wpdb->get_var($wpdb->prepare(
            "SELECT wp_post_id FROM {$wpdb->prefix}" . LTA_RECRUITMENT_TABLE . " WHERE id = %s",
            $recruitment['id']
        ));
        
        if ($existing_post) {
            $post_data['ID'] = $existing_post;
            $post_id = wp_update_post($post_data);
        } else {
            $post_id = wp_insert_post($post_data);
        }
        
        if (!is_wp_error($post_id)) {
            // Set category if specified
            $category = get_option('lta_recruitment_sync_post_category', '');
            if (!empty($category)) {
                wp_set_object_terms($post_id, $category, 'category');
            }
            
            // Add custom meta
            update_post_meta($post_id, '_lta_recruitment_id', $recruitment['id']);
            update_post_meta($post_id, '_lta_position', $recruitment['position']);
            update_post_meta($post_id, '_lta_location', $recruitment['location']);
            update_post_meta($post_id, '_lta_salary', $recruitment['salary']);
            update_post_meta($post_id, '_lta_type', $recruitment['type']);
            update_post_meta($post_id, '_lta_experience', $recruitment['experience']);
            update_post_meta($post_id, '_lta_education', $recruitment['education']);
            update_post_meta($post_id, '_lta_deadline', $recruitment['deadline']);
            
            return $post_id;
        }
        
        return false;
    }
    
    private function format_post_content($recruitment) {
        $content = '<div class="lta-recruitment">';
        $content .= '<h2>Thông tin vị trí</h2>';
        $content .= '<p><strong>Vị trí:</strong> ' . esc_html($recruitment['position']) . '</p>';
        $content .= '<p><strong>Địa điểm:</strong> ' . esc_html($recruitment['location']) . '</p>';
        $content .= '<p><strong>Mức lương:</strong> ' . esc_html($recruitment['salary']) . '</p>';
        $content .= '<p><strong>Loại công việc:</strong> ' . esc_html($recruitment['type']) . '</p>';
        $content .= '<p><strong>Kinh nghiệm:</strong> ' . esc_html($recruitment['experience']) . '</p>';
        $content .= '<p><strong>Học vấn:</strong> ' . esc_html($recruitment['education']) . '</p>';
        $content .= '<p><strong>Hạn nộp hồ sơ:</strong> ' . esc_html($recruitment['deadline']) . '</p>';
        
        $content .= '<h3>Mô tả công việc</h3>';
        $content .= '<div class="description">' . wpautop($recruitment['description']) . '</div>';
        
        if (!empty($recruitment['requirements'])) {
            $requirements = maybe_unserialize($recruitment['requirements']);
            if (is_array($requirements)) {
                $content .= '<h3>Yêu cầu công việc</h3>';
                $content .= '<ul class="requirements">';
                foreach ($requirements as $req) {
                    $content .= '<li>' . esc_html($req) . '</li>';
                }
                $content .= '</ul>';
            }
        }
        
        if (!empty($recruitment['benefits'])) {
            $benefits = maybe_unserialize($recruitment['benefits']);
            if (is_array($benefits)) {
                $content .= '<h3>Quyền lợi</h3>';
                $content .= '<ul class="benefits">';
                foreach ($benefits as $benefit) {
                    $content .= '<li>' . esc_html($benefit) . '</li>';
                }
                $content .= '</ul>';
            }
        }
        
        $content .= '</div>';
        
        return $content;
    }
    
    private function get_recruitment($id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . LTA_RECRUITMENT_TABLE;
        $recruitment = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %s", $id), ARRAY_A);
        
        if ($recruitment) {
            $recruitment['requirements'] = maybe_unserialize($recruitment['requirements']);
            $recruitment['benefits'] = maybe_unserialize($recruitment['benefits']);
        }
        
        return $recruitment;
    }
    
    private function delete_recruitment($id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . LTA_RECRUITMENT_TABLE;
        
        // Get post ID before deletion
        $post_id = $wpdb->get_var($wpdb->prepare(
            "SELECT wp_post_id FROM $table_name WHERE id = %s",
            $id
        ));
        
        // Delete from our table
        $result = $wpdb->delete($table_name, array('id' => $id));
        
        if ($result === false) {
            return array('success' => false, 'message' => 'Lỗi khi xóa dữ liệu: ' . $wpdb->last_error);
        }
        
        // Delete WordPress post if exists
        if ($post_id) {
            wp_delete_post($post_id, true);
        }
        
        return array('success' => true, 'message' => 'Xóa thành công');
    }
    
    public function get_all_recruitment($status = 'active', $limit = 50) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . LTA_RECRUITMENT_TABLE;
        
        $where_clause = '';
        if ($status !== 'all') {
            $where_clause = $wpdb->prepare("WHERE status = %s", $status);
        }
        
        $sql = "SELECT * FROM $table_name $where_clause ORDER BY created_at DESC LIMIT %d";
        $recruitments = $wpdb->get_results($wpdb->prepare($sql, $limit), ARRAY_A);
        
        foreach ($recruitments as &$recruitment) {
            $recruitment['requirements'] = maybe_unserialize($recruitment['requirements']);
            $recruitment['benefits'] = maybe_unserialize($recruitment['benefits']);
        }
        
        return $recruitments;
    }
    
    public function get_recruitment_count($status = 'active') {
        global $wpdb;
        
        $table_name = $wpdb->prefix . LTA_RECRUITMENT_TABLE;
        
        if ($status === 'all') {
            return $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
        }
        
        return $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $table_name WHERE status = %s",
            $status
        ));
    }
}

// Initialize plugin
new LTA_Recruitment_Sync();

// Add shortcode for displaying recruitment
add_shortcode('lta_recruitment_list', function($atts) {
    $atts = shortcode_atts(array(
        'status' => 'active',
        'limit' => 10,
        'type' => '',
        'location' => ''
    ), $atts);
    
    $plugin = new LTA_Recruitment_Sync();
    $recruitments = $plugin->get_all_recruitment($atts['status'], $atts['limit']);
    
    if (empty($recruitments)) {
        return '<p>Không có tin tuyển dụng nào.</p>';
    }
    
    $output = '<div class="lta-recruitment-list">';
    foreach ($recruitments as $recruitment) {
        $output .= '<div class="recruitment-item">';
        $output .= '<h3>' . esc_html($recruitment['title']) . '</h3>';
        $output .= '<p><strong>Vị trí:</strong> ' . esc_html($recruitment['position']) . '</p>';
        $output .= '<p><strong>Địa điểm:</strong> ' . esc_html($recruitment['location']) . '</p>';
        $output .= '<p><strong>Mức lương:</strong> ' . esc_html($recruitment['salary']) . '</p>';
        $output .= '<p><strong>Hạn nộp:</strong> ' . esc_html($recruitment['deadline']) . '</p>';
        $output .= '<div class="description">' . wp_trim_words($recruitment['description'], 30) . '</div>';
        $output .= '</div>';
    }
    $output .= '</div>';
    
    return $output;
});
