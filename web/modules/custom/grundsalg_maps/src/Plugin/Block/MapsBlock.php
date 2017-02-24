<?php
/**
 * @file
 * Defines a block that can be used on static pages to display maps.
 */

namespace Drupal\grundsalg_maps\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides maps block.
 *
 * @Block(
 *   id = "grundsalg_maps_block",
 *   admin_label = @Translation("Grundsalg maps block"),
 * )
 */
class MapsBlock extends BlockBase {
  /**
   * {@inheritdoc}
   */
  public function build() {
    return array(
      '#theme' => 'grundsalg_maps_map_block',
    );
  }
}
