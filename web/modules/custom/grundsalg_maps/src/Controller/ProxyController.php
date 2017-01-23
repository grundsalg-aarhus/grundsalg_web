<?php
/**
 * @file
 * Contains \Drupal\grundsalg_maps\Controller\ProxyController
 */

namespace Drupal\grundsalg_maps\Controller;

use Drupal\Core\Controller\ControllerBase;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Client;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Class ProxyController
 *
 * User to obtain JWT to access the maps services.
 *
 * @package Drupal\grundsalg_maps\Controller
 */
class ProxyController extends ControllerBase {
  /**
   * Request JWT based on API-KEY from maps proxy service.
   *
   * @return JsonResponse
   */
  public function access() {
    $client = new Client();

    try {
      $config = \Drupal::getContainer()->get('itkore_admin.itkore_config');

      try {
        $res = $client->request('POST', $config->get('grundsalg_maps_url') . '/api/token', [
          'json' => [
            'apikey' => $config->get('grundsalg_maps_apikey'),
          ]
        ]);

        $data = \GuzzleHttp\json_decode($res->getBody()->getContents());

        if (isset($data->token)) {
          return new JsonResponse($data);
        }
        else {
          return new JsonResponse([
            'message' => $data->message,
          ], 500);
        }
      }
      catch (RequestException $e) {
        return new JsonResponse([
          'message' => $e->getMessage(),
        ], 500);
      }
    }
    catch (RequestException $e) {
      throw $e;
    }
  }
}