<?php
/**
 * @file
 * @TODO: Missing documentation.
 */

namespace Drupal\grundsalg_front\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides front page content.
 *
 * @Block(
 *   id = "grundsalg_front",
 *   admin_label = @Translation("Grundsalg frontpage"),
 * )
 */
class GrundsalgFront extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $config = \Drupal::getContainer()->get('itkore_admin.itkore_config')->getAll();

    return array(
      '#type' => 'markup',
      '#theme' => 'grundsalg_front_block',
      '#text' => $config,
    );
  }

}
