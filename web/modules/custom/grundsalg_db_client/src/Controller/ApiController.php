<?php
/**
 * @file
 * Contains \Drupal\grundsalg_db_client\Controller\ApiController.
 */

namespace Drupal\grundsalg_db_client\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\Core\Http\RequestStack;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\grundsalg_db_client\Service\ContentCreationService;
use Drupal\itkore_admin\State\BaseConfig;
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
  private FileSystemInterface $fileSystem;

  public const PUBLIC_BASE_PATH = 'public://api/udstykning';

  public function __construct(
    RequestStack $requestStack,
    BaseConfig $config,
    ContentCreationService $contentCreationService,
    FileSystemInterface $fileSystem,
    LoggerChannelFactoryInterface $loggerChannelFactory
  ) {
    $this->requestStack = $requestStack;
    $this->config = $config;
    $this->contentCreationService = $contentCreationService;
    $this->fileSystem = $fileSystem;
    $this->logger = $loggerChannelFactory->get('grundsalg_db_client');
  }

  public static function create(ContainerInterface $container)
  {
    return new static(
      $container->get('request_stack'),
      $container->get('itkore_admin.itkore_config'),
      $container->get('grundsalg.content_creation'),
      $container->get('file_system'),
      $container->get('logger.factory')
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
    } catch (\Throwable $throwable) {
      return $this->error($throwable);
    }
  }

  public function grunde($sid)
  {
    try {
      $request = $this->requestStack->getCurrentRequest();

      $path = sprintf('%s/grunde.json', $sid);
      if ('POST' === $request->getMethod()) {
        $this->checkAuthorization();
        $content = $this->writeFile($path, $request->getContent());
        // We assume that the content is valid JSON.
        return new JsonResponse($content, 200, [], true);
      } else {
        // We assume that the content is valid JSON.
        return new JsonResponse($this->readFile($path), 200, [], true);
      }
    } catch (\Throwable $throwable) {
      return $this->error($throwable);
    }
  }

  public function grundeGeojson($sid)
  {
    try {
      $request = $this->requestStack->getCurrentRequest();

      $path = sprintf('%s/grunde.geojson', $sid);
      $contentType = 'application/geo+json';
      if ('POST' === $request->getMethod()) {
        $this->checkAuthorization();
        $content = $this->writeFile($path, $request->getContent());
        // We assume that the content is valid GeoJSON.
        return new JsonResponse($content, 200, [
          'content-type' => $contentType,
        ], true);
      } else {
        // We assume that the content is valid GeoJSON.
        return new JsonResponse($this->readFile($path, $contentType), 200, [
          'content-type' => $contentType,
        ], true);
      }
    } catch (\Throwable $throwable) {
      return $this->error($throwable);
    }
  }

  private function writeFile(string $path, string $content)
  {
    $path = $this->getFilePath($path);
    $dirname = $this->fileSystem->dirname($path);
    if (!is_dir($dirname)) {
      $this->fileSystem->mkdir($dirname, null, true);
    }
    $this->fileSystem->saveData($content, $path, FileSystemInterface::EXISTS_REPLACE);

    return $content;
  }

  private function readFile(string $path, string $contentType = 'application/json')
  {
    $path = $this->getFilePath($path);
    $path = $this->fileSystem->realpath($path);
    if (!$path) {
      throw new NotFoundHttpException('Not found');
    }

    // Send the file.
    header('content-type: ' . $contentType);
    readfile($path);
    exit;
  }

  private function getFilePath(string $path)
  {
    $basePath = $this->config->get('grundsalg_db_client_public_base_path', self::PUBLIC_BASE_PATH);

    return $basePath . '/' . $path;
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

  /**
   * Log exception (throwable) and create JSON response.
   *
   * @param \Throwable $throwable
   * @return JsonResponse
   */
  private function error(\Throwable $throwable)
  {
    $this->logger->error($throwable->getMessage(), [
      'throwable' => $throwable,
    ]);

    return new JsonResponse([
      'error' => true,
      'message' => $throwable->getMessage(),
      'body' => $throwable->getMessage(),
    ]);

  }
}
