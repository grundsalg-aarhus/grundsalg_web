<?php
/**
 * @file
 * Contains services to create content in Grundsalg.
 */

namespace Drupal\grundsalg_db_client\Service;

use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Drupal\node\Entity\Node;
use Drupal\taxonomy\Entity\Term;

/**
 * Class ContentCreationService.
 *
 * @package Drupal\grundsalg_db_client\Service
 */
class ContentCreationService {
  private $entityQueryService;
  private $entityTypeManager;

  /**
   * Constructor.
   */
  public function __construct($entityQueryService, $entityTypeManager) {
    $this->entityQueryService = $entityQueryService;
    $this->entityTypeManager = $entityTypeManager;
  }

  /**
   * Update Subdivision.
   *
   * 1. Checks if the overview_page the subdivision should be placed under exists,
   * else returns.
   *
   * 2. Checks if the area exists, else creates it (This also creates plot_type and
   * cities taxonomy terms).
   *
   * 3. Checks if the subdivision exists (then updates it), else creates it.
   *
   * @param array $content
   *   Array with the content fields available.
   *
   * @return string
   *   "updated" or "created" based on which operation was preformed.
   *
   * @throws NotFoundHttpException
   *   If the overview page with the right type don't exists.
   */
  public function updateSubdivision(array $content) {
    // Make sure an overview with the $type exists.
    $query = $this->entityQueryService->get('node', 'AND')
      ->condition('type', 'overview_page')
      ->condition('status', 1)
      ->condition('field_plot_type.entity.name', $content['type']);
    $nids = $query->execute();

    // Load the overview.
    if (empty($nids)) {
      throw new NotFoundHttpException('Overview page not found with type (' . $content['type'] . ').');
    }
    $overview_nid = current($nids);

    // Make sure an area with the postal code given exists.
    $query =  $this->entityQueryService->get('node', 'AND')
      ->condition('type', 'area')
      ->condition('field_plot_type.entity.name', $content['type'])
      ->condition('field_city_reference.entity.field_postalcode', $content['postalCode']);
    $nids = $query->execute();

    // If an area entity exists get the city and plot_type terms entities for
    // later use in sub-division creation/update.
    if (!empty($nids)) {
      $area = $this->entityTypeManager->getStorage('node')->load(current($nids));

      $cityTerm = $area->get('field_city_reference')->entity;
      $plotTypeTerm = $area->get('field_plot_type')->entity;
    }
    else {
      // Make sure plot_type term exists with type given in the $content.
      $query =  $this->entityQueryService->get('taxonomy_term', 'AND')
        ->condition('vid', 'plot_type')
        ->condition('name', $content['type']);
      $nids = $query->execute();

      // If plot_type does not exist, throw exception.
      if (!$nids) {
        throw new NotFoundHttpException('Plot type not found with type (' . $content['type'] . ').');
      }

      // Load the plot_type term entity.
      $plotTypeTerm = Term::load(current($nids));

      // Make sure cities term exists with postalCode, else create it.
      $query = $this->entityQueryService->get('taxonomy_term', 'AND')
        ->condition('vid', 'cities')
        ->condition('field_postalcode', $content['postalCode']);
      $nids = $query->execute();

      // If not found, create new city term.
      if (!$nids) {
        $cityTerm = Term::create([
          'name' => $content['city'],
          'vid' => 'cities',
          'field_postalcode' => $content['postalCode'],
        ]);
        $cityTerm->save();
      }
      else {
        $cityTerm = Term::load(current($nids));
      }

      $area = Node::create([
        'type' => 'area',
        'title' => $content['city'],
        'field_parent' => $overview_nid,
        'field_plot_type' => $plotTypeTerm->id(),
        'field_city_reference' => $cityTerm->id(),
      ]);
      $area->save();
    }

    // Try loading subdivision to do an update.
    $query =  $this->entityQueryService->get('node', 'AND')
      ->condition('type', 'subdivision')
      ->condition('field_subdivision_id', $content['id']);
    $nids = $query->execute();

    if ($nids) {
      // Found existing sub-division, so this will be an update operation.
      $subdivision = $this->entityTypeManager->getStorage('node')->load(current($nids));
      $subdivision->set('title', $content['title']);
      $subdivision->set('field_subdivision_id', $content['id']);
      $subdivision->set('field_parent', $area->id());
      $subdivision->set('field_plot_type', $plotTypeTerm->id());
      $subdivision->set('field_city_reference', $cityTerm->id());
      $subdivision->save();

      return 'updated';
    }
    else {
      // Create new sub-division entity.
      Node::create([
        'type' => 'subdivision',
        'title' =>  $content['title'],
        'field_subdivision_id' => $content['id'],
        'field_parent' => $area->id(),
        'field_plot_type' => $plotTypeTerm->id(),
        'field_city_reference' => $cityTerm->id(),
      ])->save();

      return 'created';
    }
  }
}