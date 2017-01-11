<?php
/**
 * @file
 * Contains services to create content in Grundsalg.
 */

namespace Drupal\grundsalg_api\Service;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Drupal\node\Entity\Node;

/**
 * Class ContentCreationService
 * @package Drupal\grundsalg_api\Service
 */
class ContentCreationService {
  /**
   * Constructor.
   */
  public function __construct() {}

  /**
   *
   */
  public function updateSubdivision($subdivisionId, $subdivisionTitle, $type, $postalCode, $cityName) {
    // Make sure an overview with the $type exists.
    $query = \Drupal::entityQuery('node')
      ->condition('type', 'overview_page')
      ->condition('status', 1)
      ->condition('field_plot_type.entity.name', $type);
    $nids = $query->execute();

    // Load the overview.
    $overview = \Drupal::entityTypeManager()->getStorage('node')->load(current($nids));

    if (!isset($overview)) {
      throw new NotFoundHttpException('Overview not found with type = ' . $type);
    }

    // Make sure an area with $postalCode exists.
    $query = \Drupal::entityQuery('node')
      ->condition('type', 'area')
      ->condition('field_plot_type.entity.name', $type)
      ->condition('field_city_reference.entity.field_postalcode', $postalCode);
    $nids = $query->execute();

    // Load the area.
    $area = \Drupal::entityTypeManager()->getStorage('node')->load(current($nids));

    // If it does not exist, create it.
    if (!isset($area)) {
      $area = Node::create([
        'type' => 'area',
        'title' => $cityName,
        'field_plot_type' => $type,
        'field_city_reference' => null,
      ]);
    }

    // Find subdivision with $subdivisionId.
    $query = \Drupal::entityQuery('node')
      ->condition('type', 'subdivision')
      ->condition('field_subdivision_id', $subdivisionId);
    $nids = $query->execute();

    // Load the subdivision.
    $subdivision = \Drupal::entityTypeManager()->getStorage('node')->load(current($nids));

    // If the subdivision does not exist, create it.
    if (!isset($subdivision)) {
      $subdivision = Node::create([
        'type'        => 'subdivision',
        'title'       =>  $subdivisionTitle,
        'field_subdivision_id' => $subdivisionId,
        'field_parent' => $area,
      ]);
    }
    else {
      // Update subdivision.title with $subdivisionTitle.
      $subdivision->set('title', $subdivisionTitle);
    }
    $subdivision->save();
  }
}