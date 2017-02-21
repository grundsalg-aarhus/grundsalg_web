<?php
/**
 * @file
 * @TODO: What it this file and is it used for any thing!
 * @TODO: All parameters documentation is missing!
 */

/**
 * Creates a subdivision and possibly area parent if they don't exist.
 *
 * @param $title
 * @param $subdivision_id
 * @param $postal_code
 * @param $plot_type
 */
function create_subdivision($title, $subdivision_id, $postal_code, $plot_type) {
  // If subdivision exists.
  if (search_subdivision($subdivision_id) > 0) { return; }

  // If overview page doesn't exist
  if (search_overview($plot_type) == 0) { return; }

  // If area exists
  if (search_area($postal_code, $plot_type)) {
    create_subdivision_node($title, $postal_code, $plot_type, $subdivision_id);
  }
  else {
    create_area_node($postal_code, $plot_type);
    create_subdivision_node($title, $postal_code, $plot_type, $subdivision_id);
  }
}

/**
 * Searches for nodes of type subdivision with the given subdivision_id.
 *
 * @param $subdivision_id
 * @return int
 */
function search_subdivision($subdivision_id) {
  // @todo look for subdivision matching id.
  $nid = 0;
  return $nid;
}

/**
 * Searches for nodes of type area with the given postal code and plot type.
 *
 * @param $postal_code
 * @param $plot_type
 * @return int
 */
function search_area($postal_code, $plot_type) {
  // @todo look for area matching postalcode and plot type.
  $nid = 0;
  return $nid;
}

/**
 * Searches for nodes of type overview_page with the given plot type.
 *
 * @param $plot_type
 * @return int
 */
function search_overview($plot_type) {
  // @todo look for overview page matching plot type.
  $nid = 0;
  return $nid;
}

/**
 * Creates an area from the given parameters.
 *
 * @param $postal_code
 * @param $plot_type
 */
function create_area_node($postal_code, $plot_type) {
  // @todo Create a node of type area.
}

/**
 * Creates subdivision from the given parameters.
 *
 * @param $postal_code
 * @param $plot_type
 */
function create_subdivision_node($title, $postal_code, $plot_type, $subdivision_id) {
  // @todo Create a node of type area.
}

/**
 * Look for plot type term in plot type taxonomy.
 *
 * @param $plot_type
 * @return bool
 */
function _plot_type_exists($plot_type) {
  // @todo look for plot type in plot type taxonomy.
  return TRUE;
}

/**
 * Look for postal code field value in term in city taxonomy.
 *
 * @param $postal_code
 * @return bool
 */
function _postal_code_exists($postal_code) {
  // @todo look for postal code in city taxonomy.
  return TRUE;
}
