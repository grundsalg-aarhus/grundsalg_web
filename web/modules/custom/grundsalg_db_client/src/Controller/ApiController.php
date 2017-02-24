<?php
/**
 * @file
 * Contains \Drupal\grundsalg_db_client\Controller\ApiController.
 */

namespace Drupal\grundsalg_db_client\Controller;

use Drupal\Core\Controller\ControllerBase;
use GuzzleHttp\Client;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * ApiController.
 */
class ApiController extends ControllerBase {

  /**
   * Endpoint to notify when a subdivision has been updated in the Fagsystem.
   *
   * @param int $sid
   *   The remote systems ID for the subdivivion.
   *
   * @return JsonResponse
   *   The result as json.
   */
  public function subdivisionUpdated($sid) {
    try {
      $config = \Drupal::getContainer()->get('itkore_admin.itkore_config');

      // Create client and fetch content from remote system.
      $client = new Client();
      $url = $config->get('grundsalg_db_client_url') . '/udstykning/' . $sid;
      $response = $client->request('GET', $url);

      // @TODO: Check for error code in $response?

      // Parse content fetched from the remote system.
      $body = $response->getBody()->getContents();
      $content = \GuzzleHttp\json_decode($body);

      // Fix content mappings.
      if ($content->type == 'Parcelhusgrund') {
        $content->type = 'Villagrund';
      }

      // Create the content.
      $contentCreationService = \Drupal::service('grundsalg.content_creation');
      $operation = $contentCreationService->updateSubdivision((array) $content);

      return new JsonResponse([
        'error' => FALSE,
        'message' => $operation,
        'body' => $body,
      ]);
    }
    catch (\Exception $e) {
      return new JsonResponse([
        'error' => TRUE,
        'message' => $e->getMessage(),
        'body' => $e->getMessage(),
      ]);
    }
  }
}