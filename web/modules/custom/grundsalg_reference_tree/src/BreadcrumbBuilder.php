<?php

/**
 * @file
 * Contains \Drupal\grundsalg_reference_tree\BreadcrumbBuilder.
 */

namespace Drupal\grundsalg_reference_tree;

use Drupal\Core\Link;
use Drupal\Core\Url;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Component\Utility\Unicode;
use Drupal\system\PathBasedBreadcrumbBuilder;
use Symfony\Cmf\Component\Routing\RouteObjectInterface;
use Drupal\node\Entity\Node;

/**
 * Adds the current page title to the breadcrumb.
 *
 * Extend PathBased Breadcrumbs to include the current page title as an unlinked
 * crumb. The module uses the path if the title is unavailable and it excludes
 * all admin paths.
 *
 * {@inheritdoc}
 */
class BreadcrumbBuilder extends PathBasedBreadcrumbBuilder {

  /**
   * {@inheritdoc}
   */
  public function build(RouteMatchInterface $route_match) {
    $breadcrumbs = parent::build($route_match);

    $request = \Drupal::request();
    $route = $request->attributes->get(RouteObjectInterface::ROUTE_OBJECT);

    // Do not adjust the breadcrumbs on admin paths.
    if ($route && !$route->getOption('_admin_route') && $route->getPath() ==  '/node/{node}') {
      $node = $request->get('node');
      if ($node->hasField('field_parent') && !empty($node->get('field_parent')->target_id)) {
        $area_id = $node->get('field_parent')->target_id;
        $area = Node::load($area_id);
        print $area->id();

        if ($area->hasField('field_parent') && !empty($area->get('field_parent')->target_id)) {
          $overview_id = $area->get('field_parent')->target_id;
          $overview = Node::load($overview_id);
          $breadcrumbs->addLink(Link::fromTextAndUrl($overview->getTitle(), Url::fromUri('entity:node/' . $overview_id)));
          print $overview->id();
        }

        $breadcrumbs->addLink(Link::fromTextAndUrl($area->getTitle(), Url::fromUri('entity:node/' . $area_id)));
      }
    }

    return $breadcrumbs;
  }
}
