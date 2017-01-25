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
   * @TODO: Should this be handled in the services API from drupal core?
   *
   * @param string $type
   *   The type of area to find.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function areas($type) {

    // @TODO: Should this be configurable? This is not a good solution.
    $plot_type = 0;
    switch ($type) {
      case 'villagrund':
        $plot_type = 47;
        break;

      case 'storparceller':
        $plot_type = 49;
        break;

      case 'erhversgrund':
        $plot_type = 48;
        break;
    }

    $nids = \Drupal::entityQuery('node')
      ->condition('type', 'area', '=')
      ->condition('field_plot_type', $plot_type, '=')
      ->condition('status', 1, '=')
      ->condition('field_coordinate', NULL, 'IS NOT NULL')
      ->execute();

    $nodes = \Drupal::entityTypeManager()->getStorage('node')->loadMultiple($nids);

    $data = array(
      'type' => 'FeatureCollection',
      'features' => array(),
    );

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
          'title' => $node->get('title')->value,
          'teaser' => $node->get('field_teaser')->value,
          'url' => $url
        ),
      );
    }

    return new JsonResponse($data);
  }
}