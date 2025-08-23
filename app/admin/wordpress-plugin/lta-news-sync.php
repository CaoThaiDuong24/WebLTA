<?php
/**
 * Plugin Name: LTA News Sync
 * Description: Tạo bài viết WordPress từ hệ thống LTA thông qua AJAX với API Key.
 * Version: 1.3.0
 * Author: LTA Team
 */

if (!defined('ABSPATH')) {
    exit;
}

// Options
const LTA_NEWS_SYNC_OPTION_KEY = 'lta_news_sync_settings';
const LTA_NEWS_SYNC_TABLE = 'lta_settings';

function lta_news_sync_default_settings() {
    return array(
        'api_key' => '',
        'webhook_url' => '',
    );
}

function lta_news_sync_get_settings() {
    global $wpdb;
    $table = $wpdb->prefix . LTA_NEWS_SYNC_TABLE;

    $db_settings = array();
    if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $table)) === $table) {
        $rows = $wpdb->get_results("SELECT setting_key, setting_value FROM {$table}", ARRAY_A);
        foreach ((array) $rows as $row) {
            $db_settings[$row['setting_key']] = maybe_unserialize($row['setting_value']);
        }
    }

    $opt_settings = get_option(LTA_NEWS_SYNC_OPTION_KEY, array());
    $defaults = lta_news_sync_default_settings();

    // Ưu tiên DB > options > defaults
    return wp_parse_args($db_settings, wp_parse_args($opt_settings, $defaults));
}

function lta_news_sync_update_settings($new_settings) {
    global $wpdb;
    $table = $wpdb->prefix . LTA_NEWS_SYNC_TABLE;
    $settings = lta_news_sync_get_settings();
    $merged = wp_parse_args($new_settings, $settings);

    // Lưu xuống options
    update_option(LTA_NEWS_SYNC_OPTION_KEY, $merged);

    // Lưu xuống DB table nếu tồn tại
    if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $table)) === $table) {
        foreach ($merged as $k => $v) {
            $wpdb->replace(
                $table,
                array(
                    'setting_key' => sanitize_key($k),
                    'setting_value' => maybe_serialize($v),
                    'updated_at' => current_time('mysql')
                ),
                array('%s','%s','%s')
            );
        }
    }

    return $merged;
}

// Admin settings page
add_action('admin_menu', function () {
    add_menu_page(
        'LTA News Sync',
        'LTA News Sync',
        'manage_options',
        'lta-news-sync',
        'lta_news_sync_render_settings_page',
        'dashicons-rss',
        80
    );
});

function lta_news_sync_render_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }

    $message = '';
    if (isset($_POST['lta_news_sync_save'])) {
        check_admin_referer('lta_news_sync_save');
        $api_key = isset($_POST['lta_api_key']) ? sanitize_text_field(wp_unslash($_POST['lta_api_key'])) : '';
        $webhook_url = isset($_POST['lta_webhook_url']) ? esc_url_raw(wp_unslash($_POST['lta_webhook_url'])) : '';
        lta_news_sync_update_settings(array(
            'api_key' => $api_key,
            'webhook_url' => $webhook_url,
        ));
        $message = 'Cập nhật cấu hình thành công.';
    }

    $settings = lta_news_sync_get_settings();
    ?>
    <div class="wrap">
        <h1>LTA News Sync</h1>
        <?php if ($message) : ?>
            <div class="notice notice-success"><p><?php echo esc_html($message); ?></p></div>
        <?php endif; ?>
        <form method="post">
            <?php wp_nonce_field('lta_news_sync_save'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="lta_api_key">API Key</label></th>
                    <td>
                        <input type="text" id="lta_api_key" name="lta_api_key" value="<?php echo esc_attr($settings['api_key']); ?>" class="regular-text" />
                        <p class="description">Nhập API Key từ hệ thống LTA (Admin → WordPress Plugin Manager).</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="lta_webhook_url">Webhook URL (tùy chọn)</label></th>
                    <td>
                        <input type="url" id="lta_webhook_url" name="lta_webhook_url" value="<?php echo esc_attr($settings['webhook_url']); ?>" class="regular-text" />
                        <p class="description">URL để gửi thông báo khi bài viết được tạo/cập nhật.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button('Lưu cấu hình', 'primary', 'lta_news_sync_save'); ?>
        </form>
        <h2>AJAX Endpoints</h2>
        <p>Tạo bài: <code><?php echo esc_url(admin_url('admin-ajax.php?action=lta_news_create')); ?></code></p>
        <p>Cập nhật bài: <code><?php echo esc_url(admin_url('admin-ajax.php?action=lta_news_update')); ?></code></p>
        <p>Xóa bài: <code><?php echo esc_url(admin_url('admin-ajax.php?action=lta_news_delete')); ?></code></p>
    </div>
    <?php
}

// Utilities: create attachment from base64 or external URL
function lta_news_sync_attach_media_from_base64($data_url, $post_id) {
    if (strpos($data_url, 'data:') !== 0) {
        return 0;
    }

    // Tối ưu: Load includes một lần duy nhất
    static $includes_loaded = false;
    if (!$includes_loaded) {
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';
        $includes_loaded = true;
    }

    // Parse data URL
    if (!preg_match('/^data:(.*?);base64,(.*)$/', $data_url, $matches)) {
        return 0;
    }
    $mime = $matches[1];
    $base64 = $matches[2];
    $binary = base64_decode($base64);
    if ($binary === false) {
        return 0;
    }

    $extension = 'png';
    if (strpos($mime, 'jpeg') !== false) $extension = 'jpg';
    elseif (strpos($mime, 'gif') !== false) $extension = 'gif';
    elseif (strpos($mime, 'webp') !== false) $extension = 'webp';

    $tmp = wp_tempnam('lta-news-');
    if (!$tmp) {
        return 0;
    }
    file_put_contents($tmp, $binary);

    $file_array = array(
        'name' => 'lta-news-' . time() . '.' . $extension,
        'type' => $mime,
        'tmp_name' => $tmp,
        'error' => 0,
        'size' => filesize($tmp),
    );

    $attachment_id = media_handle_sideload($file_array, $post_id);
    if (is_wp_error($attachment_id)) {
        @unlink($tmp);
        return 0;
    }
    return (int) $attachment_id;
}

function lta_news_sync_attach_media_from_url($url, $post_id) {
    // Tối ưu: Load includes một lần duy nhất
    static $includes_loaded = false;
    if (!$includes_loaded) {
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';
        $includes_loaded = true;
    }
    
    $attachment_id = 0;
    $html = media_sideload_image(esc_url_raw($url), $post_id, null, 'html');
    if (!is_wp_error($html)) {
        // Extract attachment id from the created image tag
        if (preg_match('/wp-image-(\d+)/', $html, $matches)) {
            $attachment_id = (int) $matches[1];
        }
    }
    return $attachment_id;
}

// AJAX handler: create post
add_action('wp_ajax_nopriv_lta_news_create', 'lta_news_sync_ajax_create_post');
add_action('wp_ajax_lta_news_create', 'lta_news_sync_ajax_create_post');

function lta_news_sync_ajax_create_post() {
    // Read JSON body
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        wp_send_json(array('success' => false, 'error' => 'Invalid JSON'), 400);
    }

    $settings = lta_news_sync_get_settings();
    $api_key = isset($data['apiKey']) ? sanitize_text_field($data['apiKey']) : '';
    if (empty($settings['api_key']) || $api_key !== $settings['api_key']) {
        wp_send_json(array('success' => false, 'error' => 'Unauthorized'), 401);
    }

    $title = isset($data['title']) ? wp_strip_all_tags($data['title']) : '';
    $content = isset($data['content']) ? wp_kses_post($data['content']) : '';
    $excerpt = isset($data['excerpt']) ? wp_kses_post($data['excerpt']) : '';
    $status_in = isset($data['status']) ? sanitize_text_field($data['status']) : 'draft';
    $status = ($status_in === 'published' || $status_in === 'publish') ? 'publish' : 'draft';
    $incoming_slug = isset($data['slug']) ? sanitize_title($data['slug']) : '';
    $category_input = isset($data['category']) ? $data['category'] : '';
    $tags_input = isset($data['tags']) ? $data['tags'] : '';
    $featured_image = isset($data['featuredImage']) ? $data['featuredImage'] : '';
    $author_username = isset($data['authorUsername']) ? sanitize_user($data['authorUsername']) : '';
    $additional_images = isset($data['additionalImages']) && is_array($data['additionalImages']) ? $data['additionalImages'] : array();

    if (empty($title) || empty($content)) {
        wp_send_json(array('success' => false, 'error' => 'Missing title or content'), 400);
    }

    // Prepare post
    $postarr = array(
        'post_title'   => $title,
        'post_content' => $content, // Không chèn ảnh bổ sung vào content
        'post_excerpt' => $excerpt,
        'post_status'  => $status,
        'post_type'    => 'post',
    );

    // Resolve author by username if provided
    if (!empty($author_username)) {
        $user = get_user_by('login', $author_username);
        if ($user && !is_wp_error($user)) {
            $postarr['post_author'] = (int) $user->ID;
        }
    }

    // Insert post
    $post_id = wp_insert_post($postarr, true);
    if (is_wp_error($post_id)) {
        wp_send_json(array('success' => false, 'error' => $post_id->get_error_message()), 500);
    }

    // Set desired slug if provided
    if (!empty($incoming_slug)) {
        wp_update_post(array(
            'ID' => $post_id,
            'post_name' => $incoming_slug,
        ));
    }

    // Set category by name if provided
    if (!empty($category_input)) {
        $cat_ids = array();
        $categories = is_array($category_input) ? $category_input : array($category_input);
        foreach ($categories as $cat_name) {
            $term = term_exists($cat_name, 'category');
            if ($term === 0 || $term === null) {
                $term = wp_insert_term($cat_name, 'category');
            }
            if (!is_wp_error($term)) {
                $cat_ids[] = (int) (is_array($term) ? $term['term_id'] : $term['term_id']);
            }
        }
        if (!empty($cat_ids)) {
            wp_set_post_terms($post_id, $cat_ids, 'category');
        }
    }

    // Set tags if provided (comma-separated string)
    if (!empty($tags_input)) {
        $tags = is_array($tags_input) ? $tags_input : explode(',', $tags_input);
        $tags = array_map('trim', $tags);
        wp_set_post_terms($post_id, $tags, 'post_tag');
    }

    // Handle featured image
    if (!empty($featured_image)) {
        $attachment_id = 0;
        if (strpos($featured_image, 'data:') === 0) {
            $attachment_id = lta_news_sync_attach_media_from_base64($featured_image, $post_id);
        } elseif (filter_var($featured_image, FILTER_VALIDATE_URL)) {
            $attachment_id = lta_news_sync_attach_media_from_url($featured_image, $post_id);
        }
        if ($attachment_id) {
            set_post_thumbnail($post_id, $attachment_id);
        }
    }

    // Tối ưu: Chỉ xử lý hình ảnh nếu thực sự cần thiết
    if (!empty($additional_images)) {
        // Giới hạn số lượng hình ảnh để tăng tốc
        $limited_images = array_slice($additional_images, 0, 10);
        
        foreach ($limited_images as $img) {
            if (is_string($img) && strpos($img, 'data:') === 0) {
                lta_news_sync_attach_media_from_base64($img, $post_id);
            } elseif (is_string($img) && filter_var($img, FILTER_VALIDATE_URL)) {
                lta_news_sync_attach_media_from_url($img, $post_id);
            }
        }
    }

    $link = get_permalink($post_id);
    wp_send_json(array(
        'success' => true,
        'data' => array(
            'id' => $post_id,
            'link' => $link,
            'status' => get_post_status($post_id),
        )
    ));
}

// AJAX handler: update post
add_action('wp_ajax_nopriv_lta_news_update', 'lta_news_sync_ajax_update_post');
add_action('wp_ajax_lta_news_update', 'lta_news_sync_ajax_update_post');

function lta_news_sync_ajax_update_post() {
    // Read JSON body
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        wp_send_json(array('success' => false, 'error' => 'Invalid JSON'), 400);
    }

    $settings = lta_news_sync_get_settings();
    $api_key = isset($data['apiKey']) ? sanitize_text_field($data['apiKey']) : '';
    if (empty($settings['api_key']) || $api_key !== $settings['api_key']) {
        wp_send_json(array('success' => false, 'error' => 'Unauthorized'), 401);
    }

    $post_id = isset($data['id']) ? intval($data['id']) : 0;
    if (!$post_id || get_post_type($post_id) !== 'post') {
        wp_send_json(array('success' => false, 'error' => 'Invalid post id'), 400);
    }

    $title = isset($data['title']) ? wp_strip_all_tags($data['title']) : null;
    $content = array_key_exists('content', $data) ? wp_kses_post($data['content']) : null;
    $excerpt = array_key_exists('excerpt', $data) ? wp_kses_post($data['excerpt']) : null;
    $status_in = isset($data['status']) ? sanitize_text_field($data['status']) : null;
    $status = ($status_in === 'published' || $status_in === 'publish') ? 'publish' : ($status_in === 'draft' ? 'draft' : null);
    $slug_in = isset($data['slug']) ? sanitize_title($data['slug']) : '';
    $featured_image = isset($data['featuredImage']) ? $data['featuredImage'] : '';
    $additional_images = isset($data['additionalImages']) && is_array($data['additionalImages']) ? $data['additionalImages'] : array();

    $postarr = array('ID' => $post_id);
    if ($title !== null) $postarr['post_title'] = $title;
    if ($content !== null) $postarr['post_content'] = $content;
    if ($excerpt !== null) $postarr['post_excerpt'] = $excerpt;
    if ($status !== null) $postarr['post_status'] = $status;

    $result = wp_update_post($postarr, true);
    if (is_wp_error($result)) {
        wp_send_json(array('success' => false, 'error' => $result->get_error_message()), 500);
    }

    if (!empty($slug_in)) {
        wp_update_post(array('ID' => $post_id, 'post_name' => $slug_in));
    }

    // Featured image
    if (!empty($featured_image)) {
        $attachment_id = 0;
        if (strpos($featured_image, 'data:') === 0) {
            $attachment_id = lta_news_sync_attach_media_from_base64($featured_image, $post_id);
        } elseif (filter_var($featured_image, FILTER_VALIDATE_URL)) {
            $attachment_id = lta_news_sync_attach_media_from_url($featured_image, $post_id);
        }
        if ($attachment_id) {
            set_post_thumbnail($post_id, $attachment_id);
        }
    }

    // Tối ưu: Chỉ xử lý hình ảnh nếu thực sự cần thiết
    if (!empty($additional_images)) {
        // Giới hạn số lượng hình ảnh để tăng tốc
        $limited_images = array_slice($additional_images, 0, 10);
        
        foreach ($limited_images as $img) {
            if (is_string($img) && strpos($img, 'data:') === 0) {
                lta_news_sync_attach_media_from_base64($img, $post_id);
            } elseif (is_string($img) && filter_var($img, FILTER_VALIDATE_URL)) {
                lta_news_sync_attach_media_from_url($img, $post_id);
            }
        }
    }

    $link = get_permalink($post_id);
    wp_send_json(array(
        'success' => true,
        'data' => array(
            'id' => $post_id,
            'link' => $link,
            'status' => get_post_status($post_id),
        )
    ));
}

// AJAX handler: delete post
add_action('wp_ajax_nopriv_lta_news_delete', 'lta_news_sync_ajax_delete_post');
add_action('wp_ajax_lta_news_delete', 'lta_news_sync_ajax_delete_post');

function lta_news_sync_ajax_delete_post() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        // Also support form-encoded fallback
        $data = $_POST;
    }

    $settings = lta_news_sync_get_settings();
    $api_key = isset($data['apiKey']) ? sanitize_text_field($data['apiKey']) : '';
    if (empty($settings['api_key']) || $api_key !== $settings['api_key']) {
        wp_send_json(array('success' => false, 'error' => 'Unauthorized'), 401);
    }

    $post_id = isset($data['id']) ? intval($data['id']) : 0;
    if (!$post_id || get_post_type($post_id) !== 'post') {
        wp_send_json(array('success' => false, 'error' => 'Invalid post id'), 400);
    }

    $res = wp_delete_post($post_id, true);
    if (!$res) {
        wp_send_json(array('success' => false, 'error' => 'Delete failed'), 500);
    }

    wp_send_json(array('success' => true, 'data' => array('id' => $post_id)));
}

// AJAX: save/get settings from app to WP DB (no REST)
add_action('wp_ajax_nopriv_lta_settings_save', 'lta_news_sync_ajax_settings_save');
add_action('wp_ajax_lta_settings_save', 'lta_news_sync_ajax_settings_save');
add_action('wp_ajax_nopriv_lta_settings_get', 'lta_news_sync_ajax_settings_get');
add_action('wp_ajax_lta_settings_get', 'lta_news_sync_ajax_settings_get');

// AJAX: get posts from WordPress (no REST)
add_action('wp_ajax_nopriv_lta_posts_get', 'lta_news_sync_ajax_get_posts');
add_action('wp_ajax_lta_posts_get', 'lta_news_sync_ajax_get_posts');

function lta_news_sync_ajax_settings_save() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) { $data = $_POST; }

    $settings = lta_news_sync_get_settings();
    $api_key = isset($data['apiKey']) ? sanitize_text_field($data['apiKey']) : '';
    if (empty($settings['api_key']) || $api_key !== $settings['api_key']) {
        wp_send_json(array('success' => false, 'error' => 'Unauthorized'), 401);
    }

    $pairs = isset($data['settings']) && is_array($data['settings']) ? $data['settings'] : array();
    $clean = array();
    foreach ($pairs as $k => $v) {
        $clean[sanitize_key($k)] = is_scalar($v) ? sanitize_text_field((string) $v) : wp_kses_post(json_encode($v));
    }
    lta_news_sync_update_settings($clean);
    wp_send_json(array('success' => true, 'data' => $clean));
}

function lta_news_sync_ajax_settings_get() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) { $data = $_POST; }

    $settings = lta_news_sync_get_settings();
    $api_key = isset($data['apiKey']) ? sanitize_text_field($data['apiKey']) : '';
    if (empty($settings['api_key']) || $api_key !== $settings['api_key']) {
        wp_send_json(array('success' => false, 'error' => 'Unauthorized'), 401);
    }

    wp_send_json(array('success' => true, 'data' => $settings));
}

// AJAX handler: get posts
function lta_news_sync_ajax_get_posts() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) { $data = $_POST; }

    $settings = lta_news_sync_get_settings();
    $api_key = isset($data['apiKey']) ? sanitize_text_field($data['apiKey']) : '';
    if (empty($settings['api_key']) || $api_key !== $settings['api_key']) {
        wp_send_json(array('success' => false, 'error' => 'Unauthorized'), 401);
    }

    // Get parameters
    $status = isset($data['status']) ? sanitize_text_field($data['status']) : 'publish,draft';
    $per_page = isset($data['per_page']) ? intval($data['per_page']) : 10;
    $page = isset($data['page']) ? intval($data['page']) : 1;
    $search = isset($data['search']) ? sanitize_text_field($data['search']) : '';

    // Build query args
    $args = array(
        'post_type' => 'post',
        'post_status' => explode(',', $status),
        'posts_per_page' => $per_page,
        'paged' => $page,
        'orderby' => 'date',
        'order' => 'DESC'
    );

    if (!empty($search)) {
        $args['s'] = $search;
    }

    $query = new WP_Query($args);
    $posts = array();

    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $post_id = get_the_ID();
            
            // Get featured image
            $featured_image = '';
            if (has_post_thumbnail($post_id)) {
                $featured_image = get_the_post_thumbnail_url($post_id, 'full');
            }

            // Get categories
            $categories = wp_get_post_categories($post_id, array('fields' => 'names'));
            
            // Get tags
            $tags = wp_get_post_tags($post_id, array('fields' => 'names'));

            $posts[] = array(
                'id' => $post_id,
                'title' => get_the_title(),
                'slug' => get_post_field('post_name', $post_id),
                'excerpt' => get_the_excerpt(),
                'content' => get_the_content(),
                'status' => get_post_status(),
                'date' => get_the_date('c'),
                'modified' => get_the_modified_date('c'),
                'author' => get_the_author(),
                'featuredImage' => $featured_image,
                'categories' => $categories,
                'tags' => $tags,
                'sticky' => is_sticky($post_id),
                'link' => get_permalink($post_id)
            );
        }
        wp_reset_postdata();
    }

    wp_send_json(array(
        'success' => true,
        'data' => $posts,
        'pagination' => array(
            'currentPage' => $page,
            'totalPages' => $query->max_num_pages,
            'totalPosts' => $query->found_posts,
            'perPage' => $per_page,
            'hasNextPage' => $page < $query->max_num_pages,
            'hasPrevPage' => $page > 1
        )
    ));
}

register_activation_hook(__FILE__, function () {
    global $wpdb;
    $table = $wpdb->prefix . LTA_NEWS_SYNC_TABLE;
    $charset_collate = $wpdb->get_charset_collate();
    $sql = "CREATE TABLE IF NOT EXISTS {$table} (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        setting_key varchar(191) NOT NULL,
        setting_value longtext NULL,
        updated_at datetime NOT NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY setting_key (setting_key)
    ) {$charset_collate};";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta($sql);

    lta_news_sync_update_settings(array());
});


