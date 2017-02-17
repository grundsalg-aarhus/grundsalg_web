<?php
/**
 * @file
 * Contains \Drupal\grundsalg_db_client\Controller\ApiController
 */

namespace Drupal\grundsalg_db_client\Controller;

use Drupal\Core\Controller\ControllerBase;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Client;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * ApiController.
 */
class ApiController extends ControllerBase {
  /**
   * Endpoint to notify when a subdivision has been updated in the Fagsystem.

   * @param $id
   *
   * @return JsonResponse
   */
  public function subdivisionUpdated($id) {
    $client = new Client();

    try {
      $config = \Drupal::getContainer()->get('itkore_admin.itkore_config');
      $url = $config->get('grundsalg_db_client_url');

      $res = $client->request('GET', $url . '/udstykning/' . $id);

      $contentCreationService = \Drupal::service('grundsalg.content_creation');

      $body = $res->getBody()->getContents();
      $body = \GuzzleHttp\json_decode($body);

      $contentCreationService->updateSubdivision($id, $body->title, $body->type, $body->postalCode, $body->city);

      return new JsonResponse([
        'message' => 'Subdivision updated/created!',
        'body' => $body,
      ]);
    } catch (RequestException $e) {
      throw $e;
    }
  }
}