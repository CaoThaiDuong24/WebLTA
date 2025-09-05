<?php
if (!defined('ABSPATH')) {
    exit;
}
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
        $plugin = new LTA_Recruitment_Sync();
        $total_count = $plugin->get_recruitment_count('all');
        $active_count = $plugin->get_recruitment_count('active');
        $inactive_count = $plugin->get_recruitment_count('inactive');
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
