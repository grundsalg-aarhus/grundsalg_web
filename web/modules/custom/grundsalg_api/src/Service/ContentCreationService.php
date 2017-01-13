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
   * Checks if the overview_page the subdivision should be placed under exists, else returns.
   * Checks if the area exists, else creates it (This also creates plot_type and cities taxonomy terms).
   * Checks if the subdivision exists (then updates it), else creates it.
   *
   * @param $subdivisionId
   *  The subdivision id supplied from Grundsalg Fagsystem.
   * @param $subdivisionTitle
   *  The title of the subdivision.
   * @param $type
   *  The type of the subdivision: Villagrund, Storparcel, Erhvervsgrund
   * @param $postalCode
   *  The postal code of the area to place the subdivision in.
   * @param $cityName
   *  The name of the city the postal code relates to.
   */
  public function updateSubdivision($subdivisionId, $subdivisionTitle, $type, $postalCode, $cityName) {
    // Make sure an overview with the $type exists.
    $query = $this->entityQueryService->get('node', 'AND')
      ->condition('type', 'overview_page')
      ->condition('status', 1)
      ->condition('field_plot_type.entity.name', $type);
    $nids = $query->execute();

    // Load the overview.
    if (count($nids) > 0) {
      $overview = $this->entityTypeManager->getStorage('node')->load(current($nids));
    }

    if (!isset($overview)) {
      throw new NotFoundHttpException('Overview not found with type = ' . $type);
    }

    // Make sure an area with $postalCode exists.
    $query =  $this->entityQueryService->get('node', 'AND')
      ->condition('type', 'area')
      ->condition('field_plot_type.entity.name', $type)
      ->condition('field_city_reference.entity.field_postalcode', $postalCode);
    $nids = $query->execute();

    // Load the area.
    if (count($nids) > 0) {
      $area = $this->entityTypeManager->getStorage('node')->load(current($nids));
    }

    // If it does not exist, create it.
    if (!isset($area)) {
      // Make sure plot_type term exists with $type, else throw exception.
      $query =  $this->entityQueryService->get('taxonomy_term', 'AND')
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
      $query = $this->entityQueryService->get('taxonomy_term', 'AND')
        ->condition('vid', 'cities')
        ->condition('field_postalcode', $postalCode);
      $nids = $query->execute();

      // Load the cities term.
      if (count($nids) > 0) {
        $cityTerm = Term::load(current($nids));
      }

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

    // Does the subdivision already exist?
    $query =  $this->entityQueryService->get('node', 'AND')
      ->condition('type', 'subdivision')
      ->condition('field_subdivision_id', $subdivisionId);
    $nids = $query->execute();

    // Load the subdivision.
    if (count($nids) > 0) {
      $subdivision = $this->entityTypeManager->getStorage('node')->load(current($nids));
    }

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
      $subdivision->set('title', $subdivisionTitle);
      $subdivision->set('field_subdivision_id', $subdivisionId);
      $subdivision->set('field_parent', $area->id());
      $subdivision->set('field_plot_type', $plotTypeTerm->id());
      $subdivision->set('field_city_reference', $cityTerm->id());
    }
    $subdivision->save();
  }
}