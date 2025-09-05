<?php
/**
 * Plugin Name: LTA Recruitment Sync
 * Description: Đồng bộ thông tin tuyển dụng từ hệ thống LTA với WordPress
 * Version: 1.0.3
 * Author: LTA Team
 */

if (!defined('ABSPATH')) {
    exit;
}

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
        
        // Thêm API để tạo bài viết từ LTA Admin
        add_action('wp_ajax_lta_create_recruitment', array($this, 'ajax_create_recruitment'));
        add_action('wp_ajax_nopriv_lta_create_recruitment', array($this, 'ajax_create_recruitment'));
        
        // Thêm API để đồng bộ ngược từ WordPress về LTA
        add_action('wp_ajax_lta_sync_to_lta', array($this, 'ajax_sync_to_lta'));
        add_action('wp_ajax_nopriv_lta_sync_to_lta', array($this, 'ajax_sync_to_lta'));
        
        // Shortcode
        add_shortcode('lta_recruitment', array($this, 'shortcode_display'));
        
        register_activation_hook(__FILE__, array($this, 'activate'));
    }
    
    public function init() {
        $this->create_table();
    }
    
    public function activate() {
        $this->create_table();
        // Set default API key if not exists
        if (!get_option('lta_recruitment_sync_api_key')) {
            add_option('lta_recruitment_sync_api_key', 'lta_recruitment_2024');
        }
    }
    
    private function create_table() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'lta_recruitment';
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
            lta_sync_time datetime NULL,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        // Thêm cột lta_sync_time nếu chưa có (cho database cũ)
        $column_exists = $wpdb->get_results("SHOW COLUMNS FROM $table_name LIKE 'lta_sync_time'");
        if (empty($column_exists)) {
            $wpdb->query("ALTER TABLE $table_name ADD COLUMN lta_sync_time datetime NULL AFTER updated_at");
        }
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'LTA Recruitment',
            'LTA Recruitment',
            'manage_options',
            'lta-recruitment',
            array($this, 'admin_page'),
            'dashicons-businessman',
            81
        );
        
        add_submenu_page(
            'lta-recruitment',
            'Quản lý dữ liệu',
            'Quản lý dữ liệu',
            'manage_options',
            'lta-recruitment-data',
            array($this, 'data_management_page')
        );
        
        add_submenu_page(
            'lta-recruitment',
            'Test đồng bộ',
            'Test đồng bộ',
            'manage_options',
            'lta-recruitment-test',
            array($this, 'test_page')
        );
    }
    
    public function admin_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        $message = '';
        if (isset($_POST['lta_save_settings'])) {
            check_admin_referer('lta_recruitment_save');
            $api_key = sanitize_text_field($_POST['api_key']);
            update_option('lta_recruitment_sync_api_key', $api_key);
            $message = 'Cập nhật thành công!';
        }
        
        $api_key = get_option('lta_recruitment_sync_api_key', 'lta_recruitment_2024');
        ?>
        <div class="wrap">
            <h1>LTA Recruitment Sync</h1>
            
            <?php if (!empty($message)): ?>
                <div class="notice notice-success">
                    <p><?php echo esc_html($message); ?></p>
                </div>
            <?php endif; ?>
            
            <div class="card">
                <h2>Cấu hình</h2>
                <form method="post">
                    <?php wp_nonce_field('lta_recruitment_save'); ?>
                    <table class="form-table">
                        <tr>
                            <th>API Key:</th>
                            <td>
                                <input type="text" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" />
                                <p class="description">API key mặc định: lta_recruitment_2024</p>
                            </td>
                        </tr>
                    </table>
                    <p><input type="submit" name="lta_save_settings" class="button-primary" value="Lưu" /></p>
                </form>
            </div>
            
            <div class="card">
                <h2>API Endpoints</h2>
                <p><strong>URL:</strong> <?php echo admin_url('admin-ajax.php'); ?></p>
                
                <h3>Đồng bộ từ LTA → WordPress:</h3>
                <p><strong>Đồng bộ dữ liệu:</strong> action=lta_sync_recruitment</p>
                <p><strong>Tạo bài viết mới:</strong> action=lta_create_recruitment</p>
                
                <h3>Đồng bộ từ WordPress → LTA:</h3>
                <p><strong>Lấy dữ liệu:</strong> action=lta_get_recruitment</p>
                <p><strong>Xuất dữ liệu:</strong> action=lta_sync_to_lta</p>
                <p><strong>Xóa dữ liệu:</strong> action=lta_delete_recruitment</p>
                
                <p><strong>Method:</strong> POST</p>
                <p><strong>Parameters:</strong> action, api_key, recruitment (nếu cần)</p>
            </div>
            
            <div class="card">
                <h2>Shortcode</h2>
                <p>Sử dụng shortcode để hiển thị danh sách tuyển dụng:</p>
                <code>[lta_recruitment limit="5" status="active"]</code>
                <p><strong>Parameters:</strong></p>
                <ul>
                    <li><strong>limit:</strong> Số lượng hiển thị (mặc định: 10)</li>
                    <li><strong>status:</strong> Trạng thái (active/inactive, mặc định: all)</li>
                </ul>
            </div>
            
            <div class="card">
                <h2>Tính năng đồng bộ 2 chiều</h2>
                <p><strong>✅ Tạo bài viết từ LTA Admin</strong> → Lưu vào database</p>
                <p><strong>✅ Đồng bộ dữ liệu từ LTA</strong> → Database</p>
                <p><strong>✅ Đồng bộ ngược từ Database</strong> → LTA (khi bị mất dữ liệu)</p>
                <p><strong>✅ Lưu vào database tùy chỉnh</strong> (wp_lta_recruitment)</p>
                <p><strong>✅ Không tạo bài viết WordPress</strong> - Chỉ lưu dữ liệu</p>
            </div>
            
            <div class="card">
                <h2>Quy trình đồng bộ 2 chiều</h2>
                <h3>LTA → Database:</h3>
                <ol>
                    <li><strong>Tạo bài viết ở LTA Admin</strong></li>
                    <li><strong>Gọi API lta_create_recruitment</strong></li>
                    <li><strong>Lưu vào database</strong> tùy chỉnh (wp_lta_recruitment)</li>
                    <li><strong>Không tạo bài viết WordPress</strong></li>
                </ol>
                
                <h3>Database → LTA:</h3>
                <ol>
                    <li><strong>Gọi API lta_sync_to_lta</strong> khi cần khôi phục dữ liệu</li>
                    <li><strong>Xuất tất cả dữ liệu</strong> từ database</li>
                    <li><strong>Import về LTA Admin</strong> để khôi phục</li>
                </ol>
            </div>
        </div>
        <?php
    }
    
    public function data_management_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'lta_recruitment';
        
        // Handle delete action
        if (isset($_GET['delete']) && wp_verify_nonce($_GET['_wpnonce'], 'delete_recruitment')) {
            $id = sanitize_text_field($_GET['delete']);
            $wpdb->delete($table_name, array('id' => $id));
            echo '<div class="notice notice-success"><p>Đã xóa thành công!</p></div>';
        }
        
        $recruitments = $wpdb->get_results("SELECT * FROM $table_name ORDER BY created_at DESC");
        ?>
        <div class="wrap">
            <h1>Quản lý dữ liệu tuyển dụng</h1>
            
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Vị trí</th>
                        <th>Địa điểm</th>
                        <th>Lương</th>
                        <th>Trạng thái</th>
                        <th>Hạn nộp</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if ($recruitments): ?>
                        <?php foreach ($recruitments as $rec): ?>
                            <tr>
                                <td><?php echo esc_html($rec->id); ?></td>
                                <td><?php echo esc_html($rec->position); ?></td>
                                <td><?php echo esc_html($rec->location); ?></td>
                                <td><?php echo esc_html($rec->salary); ?></td>
                                <td><?php echo esc_html($rec->status); ?></td>
                                <td><?php echo esc_html($rec->deadline); ?></td>
                                <td>
                                    <a href="<?php echo wp_nonce_url(admin_url('admin.php?page=lta-recruitment-data&delete=' . $rec->id), 'delete_recruitment'); ?>" 
                                       onclick="return confirm('Bạn có chắc muốn xóa?')" 
                                       class="button button-small button-link-delete">Xóa</a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="7">Chưa có dữ liệu tuyển dụng</td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
        <?php
    }
    
    public function test_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        $message = '';
        if (isset($_POST['test_create_from_lta'])) {
            check_admin_referer('lta_test_create_from_lta');
            
            $test_data = array(
                'id' => 'test-lta-' . time(),
                'title' => 'Test Tuyển dụng từ LTA Admin',
                'position' => 'Nhân viên Marketing từ LTA',
                'location' => 'Hà Nội',
                'salary' => '20-30 triệu',
                'type' => 'full-time',
                'status' => 'active',
                'description' => 'Đây là bài test tạo bài viết từ LTA Admin và lưu vào WordPress.',
                'requirements' => array('Kinh nghiệm 3-5 năm', 'Tiếng Anh tốt', 'Kỹ năng Marketing'),
                'benefits' => array('Lương thưởng hấp dẫn', 'Môi trường làm việc tốt', 'Cơ hội thăng tiến'),
                'experience' => '3-5 năm',
                'education' => 'Đại học Marketing',
                'deadline' => '2024-12-31 23:59:59'
            );
            
            $result = $this->create_wordpress_post_from_lta($test_data);
            $message = $result['message'];
        }
        
        if (isset($_POST['test_sync_to_lta'])) {
            check_admin_referer('lta_test_sync_to_lta');
            
            $result = $this->export_all_recruitment_data();
            if ($result['success']) {
                $message = "Xuất dữ liệu thành công: " . $result['count'] . " bài viết";
                $message .= "<br><strong>Dữ liệu JSON:</strong><br><pre>" . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "</pre>";
            } else {
                $message = $result['message'];
            }
        }
        ?>
        <div class="wrap">
            <h1>Test đồng bộ 2 chiều LTA ↔ Database</h1>
            
            <?php if (!empty($message)): ?>
                <div class="notice notice-info">
                    <p><?php echo $message; ?></p>
                </div>
            <?php endif; ?>
            
            <div class="card">
                <h2>Test LTA → Database</h2>
                <p>Click nút bên dưới để test lưu dữ liệu từ LTA Admin vào database:</p>
                <form method="post">
                    <?php wp_nonce_field('lta_test_create_from_lta'); ?>
                    <input type="submit" name="test_create_from_lta" class="button button-primary" value="Test lưu vào Database" />
                </form>
            </div>
            
            <div class="card">
                <h2>Test Database → LTA</h2>
                <p>Click nút bên dưới để test xuất dữ liệu từ database về LTA:</p>
                <form method="post">
                    <?php wp_nonce_field('lta_test_sync_to_lta'); ?>
                    <input type="submit" name="test_sync_to_lta" class="button button-secondary" value="Test xuất về LTA" />
                </form>
            </div>
            
            <div class="card">
                <h2>Kiểm tra kết quả</h2>
                <p>Sau khi test, kiểm tra:</p>
                <ul>
                    <li><strong>Database:</strong> <a href="<?php echo admin_url('admin.php?page=lta-recruitment-data'); ?>">Quản lý dữ liệu</a></li>
                    <li><strong>Không có bài viết WordPress</strong> được tạo</li>
                </ul>
            </div>
        </div>
        <?php
    }
    
    public function ajax_sync_recruitment() {
        $api_key = sanitize_text_field($_POST['api_key'] ?? '');
        $stored_key = get_option('lta_recruitment_sync_api_key', 'lta_recruitment_2024');
        
        if (empty($stored_key) || $api_key !== $stored_key) {
            wp_die(json_encode(['success' => false, 'message' => 'API key không hợp lệ']));
        }
        
        $recruitment_data = $_POST['recruitment'] ?? null;
        if (!$recruitment_data) {
            wp_die(json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ']));
        }
        
        $result = $this->sync_recruitment($recruitment_data);
        wp_die(json_encode($result));
    }
    
    public function ajax_get_recruitment() {
        $api_key = sanitize_text_field($_POST['api_key'] ?? '');
        $stored_key = get_option('lta_recruitment_sync_api_key', 'lta_recruitment_2024');
        
        if (empty($stored_key) || $api_key !== $stored_key) {
            wp_die(json_encode(['success' => false, 'message' => 'API key không hợp lệ']));
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'lta_recruitment';
        $recruitments = $wpdb->get_results("SELECT * FROM $table_name ORDER BY created_at DESC");
        
        wp_die(json_encode(['success' => true, 'data' => $recruitments]));
    }
    
    public function ajax_delete_recruitment() {
        $api_key = sanitize_text_field($_POST['api_key'] ?? '');
        $stored_key = get_option('lta_recruitment_sync_api_key', 'lta_recruitment_2024');
        
        if (empty($stored_key) || $api_key !== $stored_key) {
            wp_die(json_encode(['success' => false, 'message' => 'API key không hợp lệ']));
        }
        
        $id = sanitize_text_field($_POST['id'] ?? '');
        if (empty($id)) {
            wp_die(json_encode(['success' => false, 'message' => 'ID không hợp lệ']));
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'lta_recruitment';
        $result = $wpdb->delete($table_name, array('id' => $id));
        
        if ($result === false) {
            wp_die(json_encode(['success' => false, 'message' => 'Lỗi xóa dữ liệu']));
        }
        
        wp_die(json_encode(['success' => true, 'message' => 'Xóa thành công']));
    }
    
    // API để tạo bài viết tuyển dụng từ LTA Admin
    public function ajax_create_recruitment() {
        $api_key = sanitize_text_field($_POST['api_key'] ?? '');
        $stored_key = get_option('lta_recruitment_sync_api_key', 'lta_recruitment_2024');
        
        if (empty($stored_key) || $api_key !== $stored_key) {
            wp_die(json_encode(['success' => false, 'message' => 'API key không hợp lệ']));
        }
        
        $recruitment_data = $_POST['recruitment'] ?? null;
        if (!$recruitment_data) {
            wp_die(json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ']));
        }
        
        // Tạo bài viết WordPress trực tiếp
        $result = $this->create_wordpress_post_from_lta($recruitment_data);
        wp_die(json_encode($result));
    }
    
    // API để đồng bộ ngược từ WordPress về LTA
    public function ajax_sync_to_lta() {
        $api_key = sanitize_text_field($_POST['api_key'] ?? '');
        $stored_key = get_option('lta_recruitment_sync_api_key', 'lta_recruitment_2024');
        
        if (empty($stored_key) || $api_key !== $stored_key) {
            wp_die(json_encode(['success' => false, 'message' => 'API key không hợp lệ']));
        }
        
        $result = $this->export_all_recruitment_data();
        wp_die(json_encode($result));
    }
    
    // Tạo bài viết WordPress từ dữ liệu LTA Admin
    private function create_wordpress_post_from_lta($data) {
        // Chuẩn bị dữ liệu
        $recruitment = array(
            'id' => sanitize_text_field($data['id']),
            'title' => sanitize_text_field($data['title']),
            'position' => sanitize_text_field($data['position']),
            'location' => sanitize_text_field($data['location']),
            'salary' => sanitize_text_field($data['salary']),
            'type' => sanitize_text_field($data['type']),
            'status' => sanitize_text_field($data['status']),
            'description' => wp_kses_post($data['description']),
            'requirements' => maybe_serialize($data['requirements'] ?? array()),
            'benefits' => maybe_serialize($data['benefits'] ?? array()),
            'experience' => sanitize_text_field($data['experience']),
            'education' => sanitize_text_field($data['education']),
            'deadline' => sanitize_text_field($data['deadline']),
            'created_at' => current_time('mysql'),
            'updated_at' => current_time('mysql')
        );
        
        // Lưu vào database tùy chỉnh
        global $wpdb;
        $table_name = $wpdb->prefix . 'lta_recruitment';
        
        $existing = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %s", $recruitment['id']));
        
        if ($existing) {
            $db_result = $wpdb->update($table_name, $recruitment, array('id' => $recruitment['id']));
        } else {
            $db_result = $wpdb->insert($table_name, $recruitment);
        }
        
        if ($db_result === false) {
            return array('success' => false, 'message' => 'Lỗi lưu database: ' . $wpdb->last_error);
        }
        
        // Tạo bài viết WordPress
        $post_result = $this->sync_to_wordpress_post($recruitment);
        
        if (!$post_result['success']) {
            return array('success' => false, 'message' => 'Lưu database thành công nhưng lỗi tạo bài viết WordPress: ' . $post_result['message']);
        }
        
        return array(
            'success' => true, 
            'message' => 'Tạo bài viết thành công từ LTA Admin', 
            'post_id' => $post_result['post_id'],
            'db_id' => $recruitment['id']
        );
    }
    
    // Xuất tất cả dữ liệu tuyển dụng để đồng bộ về LTA
    private function export_all_recruitment_data() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'lta_recruitment';
        
        $recruitments = $wpdb->get_results("SELECT * FROM $table_name ORDER BY created_at DESC", ARRAY_A);
        
        if (empty($recruitments)) {
            return array('success' => false, 'message' => 'Không có dữ liệu tuyển dụng nào');
        }
        
        // Chuẩn bị dữ liệu để xuất
        $export_data = array();
        foreach ($recruitments as $rec) {
            $export_data[] = array(
                'id' => $rec['id'],
                'title' => $rec['title'],
                'position' => $rec['position'],
                'location' => $rec['location'],
                'salary' => $rec['salary'],
                'type' => $rec['type'],
                'status' => $rec['status'],
                'description' => $rec['description'],
                'requirements' => maybe_unserialize($rec['requirements']),
                'benefits' => maybe_unserialize($rec['benefits']),
                'experience' => $rec['experience'],
                'education' => $rec['education'],
                'deadline' => $rec['deadline'],
                'createdAt' => $rec['created_at'],
                'updatedAt' => $rec['updated_at']
            );
        }
        
        return array(
            'success' => true,
            'message' => 'Xuất dữ liệu thành công',
            'count' => count($export_data),
            'data' => $export_data
        );
    }
    
    public function shortcode_display($atts) {
        $atts = shortcode_atts(array(
            'limit' => 10,
            'status' => 'all'
        ), $atts);
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'lta_recruitment';
        
        $where_clause = '';
        if ($atts['status'] !== 'all') {
            $where_clause = $wpdb->prepare(" WHERE status = %s", $atts['status']);
        }
        
        $recruitments = $wpdb->get_results(
            "SELECT * FROM $table_name" . $where_clause . " ORDER BY created_at DESC LIMIT " . intval($atts['limit'])
        );
        
        if (empty($recruitments)) {
            return '<p>Không có tin tuyển dụng nào.</p>';
        }
        
        $output = '<div class="lta-recruitment-list">';
        foreach ($recruitments as $rec) {
            $output .= '<div class="lta-recruitment-item" style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">';
            $output .= '<h3>' . esc_html($rec->position) . '</h3>';
            $output .= '<p><strong>Địa điểm:</strong> ' . esc_html($rec->location) . '</p>';
            $output .= '<p><strong>Lương:</strong> ' . esc_html($rec->salary) . '</p>';
            $output .= '<p><strong>Kinh nghiệm:</strong> ' . esc_html($rec->experience) . '</p>';
            $output .= '<p><strong>Hạn nộp:</strong> ' . esc_html($rec->deadline) . '</p>';
            $output .= '<p>' . wp_kses_post($rec->description) . '</p>';
            $output .= '</div>';
        }
        $output .= '</div>';
        
        return $output;
    }
    
    private function sync_recruitment($data) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'lta_recruitment';
        
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
            'updated_at' => sanitize_text_field($data['updatedAt'])
        );
        
        // Lưu vào database tùy chỉnh
        $existing = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %s", $recruitment['id']));
        
        if ($existing) {
            $db_result = $wpdb->update($table_name, $recruitment, array('id' => $recruitment['id']));
        } else {
            $db_result = $wpdb->insert($table_name, $recruitment);
        }
        
        if ($db_result === false) {
            return array('success' => false, 'message' => 'Lỗi lưu database: ' . $wpdb->last_error);
        }
        
        return array('success' => true, 'message' => 'Đồng bộ thành công - Đã lưu vào database');
    }
    
    private function sync_to_wordpress_post($recruitment) {
        // Kiểm tra xem đã có bài viết WordPress chưa
        $existing_post = get_posts(array(
            'meta_key' => 'lta_recruitment_id',
            'meta_value' => $recruitment['id'],
            'post_type' => 'post',
            'post_status' => 'any',
            'numberposts' => 1
        ));
        
        // Chuẩn bị dữ liệu bài viết
        $post_data = array(
            'post_title' => $recruitment['position'],
            'post_content' => $this->format_post_content($recruitment),
            'post_status' => $recruitment['status'] === 'active' ? 'publish' : 'draft',
            'post_type' => 'post',
            'post_excerpt' => wp_trim_words($recruitment['description'], 30, '...'),
            'meta_input' => array(
                'lta_recruitment_id' => $recruitment['id'],
                'lta_position' => $recruitment['position'],
                'lta_location' => $recruitment['location'],
                'lta_salary' => $recruitment['salary'],
                'lta_type' => $recruitment['type'],
                'lta_experience' => $recruitment['experience'],
                'lta_education' => $recruitment['education'],
                'lta_deadline' => $recruitment['deadline'],
                'lta_sync_time' => current_time('mysql')
            )
        );
        
        if (!empty($existing_post)) {
            // Cập nhật bài viết hiện có
            $post_data['ID'] = $existing_post[0]->ID;
            $post_id = wp_update_post($post_data);
        } else {
            // Tạo bài viết mới từ dữ liệu LTA
            $post_id = wp_insert_post($post_data);
        }
        
        if (is_wp_error($post_id)) {
            return array('success' => false, 'message' => 'Lỗi WordPress: ' . $post_id->get_error_message());
        }
        
        // Thêm category "Tuyển dụng" nếu có
        $category = get_category_by_slug('tuyen-dung');
        if ($category) {
            wp_set_object_terms($post_id, $category->term_id, 'category');
        }
        
        return array('success' => true, 'message' => 'Đồng bộ WordPress thành công', 'post_id' => $post_id);
    }
    
    private function format_post_content($recruitment) {
        $content = '<div class="lta-recruitment-content">';
        $content .= '<h2>' . esc_html($recruitment['position']) . '</h2>';
        $content .= '<div class="recruitment-meta">';
        $content .= '<p><strong>Địa điểm:</strong> ' . esc_html($recruitment['location']) . '</p>';
        $content .= '<p><strong>Lương:</strong> ' . esc_html($recruitment['salary']) . '</p>';
        $content .= '<p><strong>Loại công việc:</strong> ' . esc_html($recruitment['type']) . '</p>';
        $content .= '<p><strong>Kinh nghiệm:</strong> ' . esc_html($recruitment['experience']) . '</p>';
        $content .= '<p><strong>Học vấn:</strong> ' . esc_html($recruitment['education']) . '</p>';
        $content .= '<p><strong>Hạn nộp:</strong> ' . esc_html($recruitment['deadline']) . '</p>';
        $content .= '</div>';
        
        $content .= '<div class="recruitment-description">';
        $content .= '<h3>Mô tả công việc</h3>';
        $content .= '<div>' . wp_kses_post($recruitment['description']) . '</div>';
        $content .= '</div>';
        
        if (!empty($recruitment['requirements'])) {
            $requirements = maybe_unserialize($recruitment['requirements']);
            if (is_array($requirements)) {
                $content .= '<div class="recruitment-requirements">';
                $content .= '<h3>Yêu cầu công việc</h3>';
                $content .= '<ul>';
                foreach ($requirements as $req) {
                    $content .= '<li>' . esc_html($req) . '</li>';
                }
                $content .= '</ul>';
                $content .= '</div>';
            }
        }
        
        if (!empty($recruitment['benefits'])) {
            $benefits = maybe_unserialize($recruitment['benefits']);
            if (is_array($benefits)) {
                $content .= '<div class="recruitment-benefits">';
                $content .= '<h3>Quyền lợi</h3>';
                $content .= '<ul>';
                foreach ($benefits as $benefit) {
                    $content .= '<li>' . esc_html($benefit) . '</li>';
                }
                $content .= '</ul>';
                $content .= '</div>';
            }
        }
        
        $content .= '</div>';
        
        return $content;
    }
}

new LTA_Recruitment_Sync();
