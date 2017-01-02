<?php

/**
 * @file
 * Contains \Drupal\grundsalg_reference_tree\BreadcrumbBuilder.
 */

namespace Drupal\grundsalg_reference_tree;

use Drupal\Core\Link;
use Drupal\Core\Url;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Breadcrumb\Breadcrumb;
use Drupal\system\PathBasedBreadcrumbBuilder;
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
    $breadcrumb = new Breadcrumb();
    $node = \Drupal::routeMatch()->getParameter('node');

    if ($node instanceof \Drupal\node\NodeInterface) {
      $breadcrumb->addLink(Link::createFromRoute(t('Home'), '<front>'));
      if ($node->hasField('field_parent') && !empty($node->get('field_parent')->target_id)) {
        $area_id = $node->get('field_parent')->target_id;
        $area = Node::load($area_id);

        if ($area->hasField('field_parent') && !empty($area->get('field_parent')->target_id)) {
          $overview_id = $area->get('field_parent')->target_id;
          $overview = Node::load($overview_id);
          $breadcrumb->addLink(Link::fromTextAndUrl($overview->getTitle(), Url::fromUri('entity:node/' . $overview_id)));
        }

        $breadcrumb->addLink(Link::fromTextAndUrl($area->getTitle(), Url::fromUri('entity:node/' . $area_id)));
      }
    }

    return $breadcrumb;
  }
}