<?php
/*
Plugin Name: LTA Categories Manager
Description: Quản lý danh mục tin tức và cung cấp REST API cho LTA Admin.
Version: 1.0.0
Author: LTA
*/

if (!defined('ABSPATH')) { exit; }

// Create custom table on activation
register_activation_hook(__FILE__, 'lta_categories_install');
function lta_categories_install() {
  global $wpdb;
  $table_name = $wpdb->prefix . 'lta_categories';
  $charset_collate = $wpdb->get_charset_collate();
  $sql = "CREATE TABLE IF NOT EXISTS $table_name (
    id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT NULL,
    term_id BIGINT(20) UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY  (id),
    UNIQUE KEY slug (slug),
    KEY term_id (term_id)
  ) $charset_collate;";
  require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
  dbDelta($sql);
}

add_action('rest_api_init', function () {
  register_rest_route('lta/v1', '/categories', array(
    array(
      'methods'  => 'GET',
      'callback' => 'lta_categories_list',
      'permission_callback' => 'lta_categories_permission'
    ),
    array(
      'methods'  => 'POST',
      'callback' => 'lta_categories_create',
      'permission_callback' => 'lta_categories_permission'
    ),
  ));

  register_rest_route('lta/v1', '/categories/(?P<id>\d+)', array(
    array(
      'methods'  => 'PUT',
      'callback' => 'lta_categories_update',
      'permission_callback' => 'lta_categories_permission'
    ),
    array(
      'methods'  => 'DELETE',
      'callback' => 'lta_categories_delete',
      'permission_callback' => 'lta_categories_permission'
    ),
  ));

  // Bulk sync all existing WP categories into custom table
  register_rest_route('lta/v1', '/categories/sync', array(
    array(
      'methods'  => 'POST',
      'callback' => 'lta_categories_sync_all',
      'permission_callback' => 'lta_categories_permission'
    ),
  ));

  // Prune specific categories by name/slug
  register_rest_route('lta/v1', '/categories/prune', array(
    array(
      'methods'  => 'POST',
      'callback' => 'lta_categories_prune',
      'permission_callback' => 'lta_categories_permission'
    ),
  ));
});

function lta_categories_permission() {
  return current_user_can('manage_categories') || current_user_can('manage_options');
}

function lta_categories_list(WP_REST_Request $request) {
  global $wpdb;
  $table = $wpdb->prefix . 'lta_categories';
  $rows = $wpdb->get_results("SELECT * FROM $table ORDER BY name ASC");
  $data = array();
  if (!empty($rows)) {
    foreach ($rows as $r) {
      $count = 0;
      if (!empty($r->term_id)) {
        $term = get_term(intval($r->term_id), 'category');
        if ($term && !is_wp_error($term)) { $count = intval($term->count); }
      }
      $data[] = array(
        'id' => intval($r->id),
        'name' => $r->name,
        'slug' => $r->slug,
        'description' => $r->description,
        'count' => $count,
        'term_id' => $r->term_id ? intval($r->term_id) : null,
      );
    }
  } else {
    $terms = get_terms(array('taxonomy' => 'category', 'hide_empty' => false));
    if (is_array($terms)) {
      foreach ($terms as $t) {
        $data[] = array(
          'id' => $t->term_id,
          'name' => $t->name,
          'slug' => $t->slug,
          'description' => $t->description,
          'count' => intval($t->count),
          'term_id' => intval($t->term_id),
        );
      }
    }
  }
  return new WP_REST_Response(array('success' => true, 'categories' => $data));
}

function lta_categories_create(WP_REST_Request $request) {
  global $wpdb;
  $table = $wpdb->prefix . 'lta_categories';
  $name = trim(sanitize_text_field($request['name']));
  $slug = sanitize_title($request['slug']);
  $description = sanitize_text_field($request['description']);
  if (empty($name)) {
    return new WP_REST_Response(array('success' => false, 'error' => 'Tên danh mục là bắt buộc'), 400);
  }
  if (empty($slug)) { $slug = sanitize_title($name); }
  $existing = get_term_by('slug', $slug, 'category');
  if ($existing && !is_wp_error($existing)) {
    $term_id = $existing->term_id;
  } else {
    $result = wp_insert_term($name, 'category', array('slug' => $slug, 'description' => $description));
    if (is_wp_error($result)) {
      return new WP_REST_Response(array('success' => false, 'error' => $result->get_error_message()), 400);
    }
    $term_id = intval($result['term_id']);
    if (!empty($description)) { wp_update_term($term_id, 'category', array('description' => $description)); }
  }
  $exists_row = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table WHERE slug = %s", $slug));
  if ($exists_row) {
    $wpdb->update($table, array('name' => $name, 'description' => $description, 'term_id' => $term_id), array('id' => intval($exists_row)));
    $id = intval($exists_row);
  } else {
    $wpdb->insert($table, array('name' => $name, 'slug' => $slug, 'description' => $description, 'term_id' => $term_id));
    $id = intval($wpdb->insert_id);
  }
  $term_obj = get_term($term_id, 'category');
  return new WP_REST_Response(array('success' => true, 'category' => array(
    'id' => $id,
    'name' => $name,
    'slug' => $slug,
    'description' => $description,
    'count' => $term_obj && !is_wp_error($term_obj) ? intval($term_obj->count) : 0,
    'term_id' => $term_id,
  )));
}

function lta_categories_update(WP_REST_Request $request) {
  global $wpdb;
  $table = $wpdb->prefix . 'lta_categories';
  $id = intval($request['id']);
  $name = isset($request['name']) ? trim(sanitize_text_field($request['name'])) : null;
  $slug = isset($request['slug']) ? sanitize_title($request['slug']) : null;
  $description = isset($request['description']) ? sanitize_text_field($request['description']) : null;
  if (!$id) {
    return new WP_REST_Response(array('success' => false, 'error' => 'Thiếu id'), 400);
  }
  $row = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $id));
  if (!$row) {
    return new WP_REST_Response(array('success' => false, 'error' => 'Không tìm thấy danh mục'), 404);
  }
  $term_id = intval($row->term_id);
  $args = array();
  if (!is_null($name)) $args['name'] = $name;
  if (!is_null($slug)) $args['slug'] = $slug;
  if (!is_null($description)) $args['description'] = $description;
  if ($term_id) {
    $result = wp_update_term($term_id, 'category', $args);
    if (is_wp_error($result)) {
      return new WP_REST_Response(array('success' => false, 'error' => $result->get_error_message()), 400);
    }
  }
  $updateData = array();
  if (!is_null($name)) $updateData['name'] = $name;
  if (!is_null($slug)) $updateData['slug'] = $slug;
  if (!is_null($description)) $updateData['description'] = $description;
  if (!empty($updateData)) { $wpdb->update($table, $updateData, array('id' => $id)); }
  $new = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $id));
  $count = 0;
  if ($term_id) { $t = get_term($term_id, 'category'); if ($t && !is_wp_error($t)) { $count = intval($t->count); } }
  return new WP_REST_Response(array('success' => true, 'category' => array(
    'id' => intval($new->id),
    'name' => $new->name,
    'slug' => $new->slug,
    'description' => $new->description,
    'count' => $count,
    'term_id' => $term_id ?: null,
  )));
}

function lta_categories_delete(WP_REST_Request $request) {
  global $wpdb;
  $table = $wpdb->prefix . 'lta_categories';
  $id = intval($request['id']);
  if (!$id) {
    return new WP_REST_Response(array('success' => false, 'error' => 'Thiếu id'), 400);
  }
  $row = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $id));
  if ($row && $row->term_id) {
    $result = wp_delete_term(intval($row->term_id), 'category');
    if (is_wp_error($result)) {
      return new WP_REST_Response(array('success' => false, 'error' => $result->get_error_message()), 400);
    }
  }
  $wpdb->delete($table, array('id' => $id));
  return new WP_REST_Response(array('success' => true));
}

function lta_categories_sync_all(WP_REST_Request $request) {
  global $wpdb;
  $table = $wpdb->prefix . 'lta_categories';
  $terms = get_terms(array('taxonomy' => 'category', 'hide_empty' => false));
  if (is_wp_error($terms)) {
    return new WP_REST_Response(array('success' => false, 'error' => $terms->get_error_message()), 500);
  }
  $inserted = 0; $updated = 0; $errors = array();
  foreach ($terms as $t) {
    $slug = $t->slug;
    $name = $t->name;
    $description = $t->description;
    $term_id = $t->term_id;
    $exists_row = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table WHERE slug = %s", $slug));
    if ($exists_row) {
      $res = $wpdb->update($table, array('name' => $name, 'description' => $description, 'term_id' => $term_id), array('id' => intval($exists_row)));
      if ($res === false) { $errors[] = $slug; } else { $updated++; }
    } else {
      $res = $wpdb->insert($table, array('name' => $name, 'slug' => $slug, 'description' => $description, 'term_id' => $term_id));
      if ($res === false) { $errors[] = $slug; } else { $inserted++; }
    }
  }
  return new WP_REST_Response(array('success' => true, 'inserted' => $inserted, 'updated' => $updated, 'errors' => $errors));
}

function lta_categories_prune(WP_REST_Request $request) {
  global $wpdb;
  $table = $wpdb->prefix . 'lta_categories';
  $items = $request['items']; // array of names or slugs
  if (!is_array($items) || empty($items)) {
    return new WP_REST_Response(array('success' => false, 'error' => 'Thiếu danh sách items'), 400);
  }
  $deleted = array(); $failed = array();
  foreach ($items as $raw) {
    $needle = trim(strtolower($raw));
    // Find by slug or name
    $row = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE LOWER(slug)=%s OR LOWER(name)=%s", $needle, $needle));
    if (!$row) {
      // try term lookup
      $term = get_term_by('slug', $needle, 'category');
      if (!$term) { $term = get_term_by('name', $raw, 'category'); }
      if ($term && !is_wp_error($term)) {
        $wpdb->delete($table, array('term_id' => intval($term->term_id)));
        $res = wp_delete_term(intval($term->term_id), 'category');
        if (!is_wp_error($res)) { $deleted[] = $raw; } else { $failed[] = $raw; }
      } else {
        $failed[] = $raw;
      }
      continue;
    }
    if (!empty($row->term_id)) {
      $res = wp_delete_term(intval($row->term_id), 'category');
      if (is_wp_error($res)) { $failed[] = $raw; continue; }
    }
    $wpdb->delete($table, array('id' => intval($row->id)));
    $deleted[] = $raw;
  }
  return new WP_REST_Response(array('success' => true, 'deleted' => $deleted, 'failed' => $failed));
}


