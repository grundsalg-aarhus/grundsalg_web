<?php
/**
 * @file
 * Contains \Drupal\grundsalg_db_client\Controller\ApiController.
 */

namespace Drupal\grundsalg_db_client\Controller;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\Core\Http\RequestStack;
use Drupal\grundsalg_db_client\Service\ContentCreationService;
use Drupal\itkore_admin\State\BaseConfig;
use GuzzleHttp\Client;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * ApiController.
 */
class ApiController extends ControllerBase
{
  private RequestStack $requestStack;
  private BaseConfig $config;
  private ContentCreationService $contentCreationService;
  private FileUrlGeneratorInterface $fileUrlGenerator;
  private FileSystemInterface $fileSystem;

  public function __construct(
    RequestStack $requestStack,
    BaseConfig $config,
    ContentCreationService $contentCreationService,
    FileUrlGeneratorInterface $fileUrlGenerator,
    FileSystemInterface $fileSystem
  ) {
    $this->requestStack = $requestStack;
    $this->config = $config;
    $this->contentCreationService = $contentCreationService;
    $this->fileUrlGenerator = $fileUrlGenerator;
    $this->fileSystem = $fileSystem;
  }

  public static function create(ContainerInterface $container)
  {
    return new static(
      $container->get('request_stack'),
      $container->get('itkore_admin.itkore_config'),
      $container->get('grundsalg.content_creation'),
      $container->get('file_url_generator'),
      $container->get('file_system')
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
  public function subdivisionUpdated($sid)
  {
    try {
      $request = $this->requestStack->getCurrentRequest();

      $this->checkAuthorization();

      // Parse content fetched from the remote system.
      $body = $request->getContent();
      $content = \GuzzleHttp\json_decode($body);

      // Fix content mappings.
      if ($content->type == 'Parcelhusgrund') {
        $content->type = 'Villagrund';
      }

      // Create the content.
      $operation = $this->contentCreationService->updateSubdivision((array)$content);

      return new JsonResponse([
        'error' => false,
        'message' => $operation,
        'body' => $body,
      ]);
    } catch (\Exception $e) {
      return new JsonResponse([
        'error' => true,
        'message' => $e->getMessage(),
        'body' => $e->getMessage(),
      ]);
    }
  }

  public function grunde($sid)
  {
    try {
      $request = $this->requestStack->getCurrentRequest();

      $path = sprintf('public://api/udtrykning/%s/grunde.json', $sid);
      if ('POST' === $request->getMethod()) {
        $this->checkAuthorization();
        $content = $this->writeFile($path, $request->getContent());
        return new JsonResponse($content);
      } else {
        return new JsonResponse($this->readFile($path), 200, [], true);
      }
    } catch (\Exception $e) {
      return new JsonResponse([
        'error' => true,
        'message' => $e->getMessage(),
        'body' => $e->getMessage(),
      ]);
    }
  }

  public function grundeGeojson($sid)
  {
    try {
      $request = $this->requestStack->getCurrentRequest();

      $path = sprintf('public://api/udtrykning/%s/grunde.geojson', $sid);
      if ('POST' === $request->getMethod()) {
        $this->checkAuthorization();
        $content = $this->writeFile($path, $request->getContent());
        return new JsonResponse($content);
      } else {
        $contentType = 'application/geo+json';
        return new JsonResponse($this->readFile($path, $contentType), 200, [
          'content-type' => $contentType,
        ], true);
      }
    } catch (\Exception $e) {
      return new JsonResponse([
        'error' => true,
        'message' => $e->getMessage(),
        'body' => $e->getMessage(),
      ]);
    }
  }

  private function writeFile(string $path, string $content)
  {
    $dirname = $this->fileSystem->dirname($path);
    if (!is_dir($dirname)) {
      $this->fileSystem->mkdir($dirname, null, true);
    }
    $this->fileSystem->saveData($content, $path, FileSystemInterface::EXISTS_REPLACE);

    return $content;
  }

  private function readFile(string $path, string $contentType = 'application/json')
  {
    $path = $this->fileSystem->realpath($path);
    if (!$path) {
      throw new NotFoundHttpException('Not found');
    }

    // Send the file.
    header('content-type: ' . $contentType);
    readfile($path);
    exit;
  }

  private function checkAuthorization()
  {
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
  }
}
