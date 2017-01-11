<?php
/**
 * @file
 * Contains services to create content in Grundsalg.
 */

namespace Drupal\grundsalg_api\Service;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Drupal\node\Entity\Node;
use Drupal\taxonomy\Entity\Term;

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
      // Make sure plot_type term exists with $type, else throw exception.
      $query = \Drupal::entityQuery('taxonomy_term')
        ->condition('vid', 'plot_type')
        ->condition('name', $type);
      $nids = $query->execute();

      // Load the plot_type term.
      $plotTypeTerm = Term::load(current($nids));

      // If plot_type does not exist, throw exception.
      if (!isset($plotTypeTerm)) {
        throw new NotFoundHttpException('Plot type not found with type = ' . $type);
      }

      // Make sure cities term exists with postalCode, else create it.
      $query = \Drupal::entityQuery('taxonomy_term')
        ->condition('vid', 'cities')
        ->condition('field_postalcode', $postalCode);
      $nids = $query->execute();

      // Load the cities term.
      $cityTerm = Term::load(current($nids));

      // If cities term does not exist, create it.
      if (!isset($cityTerm)) {
        $cityTerm = Term::create([
          'name' => $cityName,
          'vid' => 'cities',
          'field_postalcode' => $postalCode,
        ]);

        $cityTerm->save();
      }

      $area = Node::create([
        'type' => 'area',
        'title' => $cityName,
        'field_parent' => $overview->id(),
        'field_plot_type' => $plotTypeTerm->id(),
        'field_city_reference' => $cityTerm->id(),
      ]);

      $area->save();
    }
    else {
      $cityTerm = $area->get('field_city_reference')->entity;
      $plotTypeTerm = $area->get('field_plot_type')->entity;
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
        'field_parent' => $area->id(),
        'field_plot_type' => $plotTypeTerm->id(),
        'field_city_reference' => $cityTerm->id(),
      ]);
    }
    else {
      // Update subdivision.title with $subdivisionTitle.
      $subdivision->set('title', $subdivisionTitle);
    }
    $subdivision->save();
  }
}