<?php
/**
 * @file
 * Contains \Drupal\grundsalg_api\Controller\ApiController
 */

namespace Drupal\grundsalg_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Client;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * ApiController.
 */
class ApiController extends ControllerBase {
  /**
   * Endpoint to notify when an udstykning has been updated in the Fagsystem.

   * @param $id
   *
   * @return JsonResponse
   */
  public function udstykningUpdated($id) {
    $client = new Client();

    try {
      $res = $client->request('GET', 'http://192.168.50.118/public/api/udstykning/' . $id);

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