<?php
/**
 * @file
 * Contains \Drupal\grundsalg_db_client\Controller\ApiController.
 */

namespace Drupal\grundsalg_db_client\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Http\RequestStack;
use Drupal\grundsalg_db_client\Service\ContentCreationService;
use Drupal\itkore_admin\State\BaseConfig;
use GuzzleHttp\Client;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * ApiController.
 */
class ApiController extends ControllerBase {
  private RequestStack $requestStack;
  private BaseConfig $config;
  private ContentCreationService $contentCreationService;

  public function __construct(RequestStack $requestStack, BaseConfig $config, ContentCreationService $contentCreationService)
  {
    $this->requestStack = $requestStack;
    $this->config = $config;
    $this->contentCreationService = $contentCreationService;
  }

  public static function create(ContainerInterface $container)
  {
    return new static(
      $container->get('request_stack'),
      $container->get('itkore_admin.itkore_config'),
      $container->get('grundsalg.content_creation')
    );
  }

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
      $request = $this->requestStack->getCurrentRequest();

      $authorization = $request->headers->get('authorization', '');
      if (!preg_match('/^Token\s+(?P<token>.+)$/i', $authorization, $matches)) {
        throw new AccessDeniedHttpException('Not authorized');
      }

      $token = $matches['token'];
      $expectedToken = $this->config->get('grundsalg_db_client_api_token');
      if ($expectedToken !== $token) {
        throw new AccessDeniedHttpException('Not authorized');
      }

      // Parse content fetched from the remote system.
      $body = $request->getContent();
      $content = \GuzzleHttp\json_decode($body);

      // Fix content mappings.
      if ($content->type == 'Parcelhusgrund') {
        $content->type = 'Villagrund';
      }

      // Create the content.
      $operation = $this->contentCreationService->updateSubdivision((array) $content);

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
