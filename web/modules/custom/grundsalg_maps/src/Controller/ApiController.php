<?php
/**
 * @file
 * Contains \Drupal\grundsalg_maps\Controller\ApiController
 */

namespace Drupal\grundsalg_maps\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Class ApiController.
 *
 * @package Drupal\grundsalg_maps\Controller
 */
class ApiController extends ControllerBase {

  /**
   * Load geoJSON information about areas based on area type.
   *
   * @param string $tid
   *   The taxonomy id plot type to load areas for.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function areas($tid) {
    // Find all areas with the plot type and coordinates set.
    $nids = \Drupal::entityQuery('node')
      ->condition('type', 'area', '=')
      ->condition('field_plot_type', $tid, '=')
      ->condition('status', 1, '=')
      ->condition('field_coordinate', NULL, 'IS NOT NULL')
      ->execute();
    $nodes = \Drupal::entityTypeManager()->getStorage('node')->loadMultiple($nids);

    // GeoJSON basic array.
    $data = array(
      'type' => 'FeatureCollection',
      'features' => array(),
    );

    // Loop over the areas and create geoJSON features base on it.
    foreach ($nodes as $node) {
      $options = array('absolute' => FALSE);
      $url = \Drupal\Core\Url::fromRoute('entity.node.canonical', array('node' => $node->id()), $options);
      $url = $url->toString();

      $coordinates = $node->get('field_coordinate')->value;
      $coordinates = explode(',', str_replace(' ', '', $coordinates));

      $data['features'][] = array(
        'type' => 'Feature',
        'geometry' => array(
          'type' => "Point",
          'coordinates' => array($coordinates[1], $coordinates[0]),
        ),
        'properties' => array(
          // If true popup will be enabled for the feature.
          'markers' => TRUE,
          'title' => $node->get('title')->value,
          'teaser' => $node->get('field_teaser')->value,
          'url' => $url
        ),
      );
    }

    // Transform to JSON and return the result.
    return new JsonResponse($data);
  }

  /**
   * Load subdivisions for an area for a given type.
   *
   * @param int $aid
   *   The id of the area.
   * @param int $tid
   *   The taxonomy id of the overview type.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   GeoJSON encode result.
   */
  public function subdivision($aid, $tid) {
    $nids = \Drupal::entityQuery('node')
      ->condition('type', 'subdivision', '=')
      ->condition('field_parent', $aid, '=')
      ->condition('field_plot_type', $tid, '=')
      ->condition('status', 1, '=')
      ->condition('field_coordinate', NULL, 'IS NOT NULL')
      ->execute();
    $nodes = \Drupal::entityTypeManager()->getStorage('node')->loadMultiple($nids);

    // GeoJSON basic array.
    $data = array(
      'type' => 'FeatureCollection',
      'features' => array(),
    );

    // Loop over the areas and create geoJSON features base on it.
    foreach ($nodes as $node) {
      $options = array('absolute' => FALSE);
      $url = \Drupal\Core\Url::fromRoute('entity.node.canonical', array('node' => $node->id()), $options);
      $url = $url->toString();

      $coordinates = $node->get('field_coordinate')->value;
      $coordinates = explode(',', str_replace(' ', '', $coordinates));

      $data['features'][] = array(
        'type' => 'Feature',
        'geometry' => array(
          'type' => "Point",
          'coordinates' => array($coordinates[1], $coordinates[0]),
        ),
        'properties' => array(
          // If true popup will be enabled for the feature.
          'markers' => TRUE,
          'title' => $node->get('title')->value,
          'teaser' => $node->get('field_teaser')->value,
          'url' => $url
        ),
      );
    }

    // Transform to JSON and return the result.
    return new JsonResponse($data);
  }

  /**
   * Get all entities of type project at GeoJson.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   GeoJson encode project entities.
   */
  public function projects() {
    $nids = \Drupal::entityQuery('node')
      ->condition('type', 'project', '=')
      ->condition('status', 1, '=')
      ->condition('field_coordinate', NULL, 'IS NOT NULL')
      ->execute();
    $nodes = \Drupal::entityTypeManager()->getStorage('node')->loadMultiple($nids);

    // GeoJSON basic array.
    $data = array(
      'type' => 'FeatureCollection',
      'features' => array(),
    );

    // Loop over the areas and create geoJSON features base on it.
    foreach ($nodes as $node) {
      $coordinates = $node->get('field_coordinate')->value;
      $coordinates = explode(',', str_replace(' ', '', $coordinates));

      $data['features'][] = array(
        'type' => 'Feature',
        'geometry' => array(
          'type' => "Point",
          'coordinates' => array($coordinates[1], $coordinates[0]),
        ),
        'properties' => array(
          // If true popup will be enabled for the feature.
          'markers' => TRUE,
          'title' => $node->get('title')->value,
          'teaser' => $node->get('field_teaser')->value,
          'url' => $node->get('field_external_link')->uri,
        ),
      );
    }

    // Transform to JSON and return the result.
    return new JsonResponse($data);
  }
}