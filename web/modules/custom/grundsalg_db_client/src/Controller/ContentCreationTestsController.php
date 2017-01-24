<?php
/**
 * @file
 * Contains \Drupal\grundsalg_db_client\Controller\ContentCreationTestsController
 *
 * Notice! This a hacked way of testing the Service.
 * You should point to a testing database and not expose the route in prod.
 *
 * @TODO: Fix setup so this can be implemented as a regular drupal Test.
 *
 * Add to routing.yml:
 * grundsalg.api.test_content_creation:
 *   path: '/api/content_creation/test'
 *   defaults:
 *     _controller: '\Drupal\grundsalg_api\Controller\ContentCreationTestsController::runTests'
 *   requirements:
 *     _permission: 'access content'
 *     _method: 'GET'
 */

namespace Drupal\grundsalg_db_client\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\taxonomy\Entity\Term;
use Drupal\node\Entity\Node;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * ContentCreationTestsController.
 */
class ContentCreationTestsController extends ControllerBase {
  private $contentCreationService;

  /**
   * Cleans out:
   * - overview_page
   * - area
   * - subdivision
   * - cities
   * - plot_type
   */
  public function cleanContent() {
    $types = ['subdivision', 'area', 'overview_page'];

    foreach ($types as $type) {
      $query = \Drupal::entityQuery('node')
        ->condition('type', $type);
      $nids = $query->execute();

      $entities = \Drupal::entityTypeManager()->getStorage('node')->loadMultiple($nids);

      foreach ($entities as $entity) {
        $entity->delete();
      }
    }

    $types = ['cities', 'plot_type'];

    foreach ($types as $type) {
      $query = \Drupal::entityQuery('taxonomy_term')
        ->condition('vid', $type);
      $nids = $query->execute();

      $entities = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadMultiple($nids);

      foreach ($entities as $entity) {
        $entity->delete();
      }
    }
  }

  /**
   * Creates base content.
   */
  public function createBaseContent() {
    // Create plot_types and overview_pages
    $plot_types = [
      [
        'name' => 'Villagrund'
      ],
      [
        'name' => 'Storparcel'
      ],
      [
        'name' => 'Erhvervsgrund'
      ],
    ];
    $overview_pages = [];
    foreach ($plot_types as &$plot_type) {
      $plotTerm = Term::create([
        'name' => $plot_type['name'],
        'vid' => 'plot_type',
      ]);

      $plotTerm->save();

      $plot_type['term'] = $plotTerm->id();

      // Create overview_pages
      $overview_page = Node::create([
        'type'        => 'overview_page',
        'title'       =>  $plot_type['name'],
        'field_plot_type' => $plotTerm,
      ]);

      $overview_page->save();

      $overview_pages[] = $overview_page;
    }

    // Create cities and areas.
    $cities = [
      [
        'postal' => 8200,
        'name' => 'TestBy1'
      ],
      [
        'postal' => 8500,
        'name' => 'TestBy2'
      ],
    ];
    foreach ($cities as $city) {
      $cityTerm = Term::create([
        'name' => $city['name'],
        'vid' => 'cities',
        'field_postalcode' => $city['postal'],
      ]);

      $cityTerm->save();

      $area = Node::create([
        'type' => 'area',
        'title' => $city['name'],
        'field_parent' => $overview_pages[0]->id(),
        'field_plot_type' => $plot_types[0]['term'],
        'field_city_reference' => $cityTerm->id(),
      ]);

      $area->save();
    }
  }

  /**
   * Run all tests.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function runTests() {
    $this->contentCreationService = \Drupal::service('grundsalg.content_creation');

    $this->cleanContent();
    $this->createBaseContent();

    $results['test1'] = $this->test1();
    $results['test2'] = $this->test2();

    $this->cleanContent();
    $this->createBaseContent();

    $results['test3'] = $this->test3();

    $this->cleanContent();
    $this->createBaseContent();

    $results['test4'] = $this->test4();

    $this->cleanContent();
    $this->createBaseContent();

    $results['test5'] = $this->test5();

    $this->cleanContent();
    $this->createBaseContent();

    $results['test6'] = $this->test6();

    return new JsonResponse($results);
  }

  /**
   * Test if a subdivision can be created.
   *
   * @return bool
   */
  public function test1() {
    $this->contentCreationService->updateSubdivision(1, 'SubTest1', 'Villagrund', 8200, 'TestBy1');

    $query = \Drupal::entityQuery('node')
      ->condition('type', 'subdivision')
      ->condition('field_subdivision_id', 1);
    $nids = $query->execute();

    return count($nids) == 1;
  }

  /**
   * Test that a subdivision is not created if there is no overview with given plot_type.
   */
  public function test2() {
    try {
      $this->contentCreationService->updateSubdivision(2, 'SubTest2', 'FISK', 8200, 'TestBy1');
    }
    catch (NotFoundHttpException $e) {
       return true;
    }

    return false;
  }

  /**
   * Test that multiple changes to a subdivision does not result in more subdivisions with the same subdivision_id.
   */
  public function test3() {
    $this->contentCreationService->updateSubdivision(1, 'SubTest1', 'Villagrund', 8200, 'TestBy1');
    $this->contentCreationService->updateSubdivision(1, 'SubTest2', 'Villagrund', 8200, 'TestBy1');
    $this->contentCreationService->updateSubdivision(1, 'SubTest3', 'Villagrund', 8200, 'TestBy1');
    $query = \Drupal::entityQuery('node')
      ->condition('type', 'subdivision')
      ->condition('field_subdivision_id', 1);
    $nids = $query->execute();

    return count($nids) == 1;
  }

  /**
   * Test that multiple subdivisions can be created.
   */
  public function test4() {
    $this->contentCreationService->updateSubdivision(1, 'SubTest1', 'Villagrund', 8200, 'TestBy1');
    $this->contentCreationService->updateSubdivision(2, 'SubTest2', 'Villagrund', 8200, 'TestBy1');
    $this->contentCreationService->updateSubdivision(3, 'SubTest3', 'Villagrund', 8200, 'TestBy1');
    $query = \Drupal::entityQuery('node')
      ->condition('type', 'subdivision');
    $nids = $query->execute();

    return count($nids) == 3;
  }

  /**
   * Test that a subdivision can be created for an city that does not exist.
   * The city and corresponding area should be created.
   */
  public function test5() {
    $this->contentCreationService->updateSubdivision(1, 'SubTest1', 'Villagrund', 9999, 'TestBy3');
    $query = \Drupal::entityQuery('node')
      ->condition('type', 'subdivision')
      ->condition('field_subdivision_id', 1);
    $nids = $query->execute();

    $query = \Drupal::entityQuery('taxonomy_term')
      ->condition('vid', 'cities')
      ->condition('field_postalcode', 9999);
    $tids = $query->execute();

    $query = \Drupal::entityQuery('node')
      ->condition('type', 'area')
      ->condition('field_city_reference.entity.field_postalcode', 9999);
    $aids = $query->execute();

    return count($nids) == 1 && count($tids) == 1 && count($aids) == 1;
  }

  /**
   * Test that a subdivision can be updated with new area and postal_code.
   */
  public function test6() {
    $this->contentCreationService->updateSubdivision(1, 'SubTest1', 'Villagrund', 9999, 'TestBy3');
    $this->contentCreationService->updateSubdivision(1, 'SubTest2', 'Villagrund', 8888, 'TestBy4');
    $this->contentCreationService->updateSubdivision(1, 'SubTest1', 'Villagrund', 9999, 'TestBy3');
    $this->contentCreationService->updateSubdivision(1, 'SubTest2', 'Villagrund', 8888, 'TestBy4');

    $query = \Drupal::entityQuery('node')
      ->condition('type', 'subdivision')
      ->condition('field_subdivision_id', 1);
    $nids1 = $query->execute();

    $query = \Drupal::entityQuery('node')
      ->condition('type', 'subdivision')
      ->condition('field_subdivision_id', 1)
      ->condition('title', 'SubTest2')
      ->condition('field_city_reference.entity.field_postalcode', 8888)
      ->condition('field_city_reference.entity.name', 'TestBy4');
    $nids2 = $query->execute();

    $query = \Drupal::entityQuery('node')
      ->condition('type', 'subdivision')
      ->condition('field_subdivision_id', 1)
      ->condition('title', 'SubTest1');
    $nids3 = $query->execute();

    return count($nids1) == 1 && count($nids2) == 1 && count($nids3) == 0;
  }
}