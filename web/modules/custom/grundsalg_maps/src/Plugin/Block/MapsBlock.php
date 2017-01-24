<?php

namespace Drupal\grundsalg_maps\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides maps block.
 *
 * @TODO: Not sure that this is the right way to get the maps view loaded onto
 *        overview pages.
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
      '#markup' => '
        <div ng-controller="MapController">
          <div class="map">
            <div class="map--inner">
              <div id="mapid" class="map--view"></div>
            </div>
          </div>
        </div>',
    );
  }
}
