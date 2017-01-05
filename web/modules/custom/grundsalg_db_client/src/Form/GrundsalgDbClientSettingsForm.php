<?php
/**
 * @file
 * Contains Drupal\itkore_admin\Form\ItkoreSettingsForm.
 */

namespace Drupal\grundsalg_db_client\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class GrundsalgDbClientSettingsForm
 *
 * @package Drupal\itkore_admin\Form
 */
class GrundsalgDbClientSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'grundsalg_db_client_settings';
  }


  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'grundsalg_db_client.settings'
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('grundsalg_db_client.settings');

    // Add front page wrapper.
    $form['wrapper'] = array(
      '#title' => $this->t('Grundsalg DB client settings'),
      '#type' => 'item',
      '#description' => $this->t('Settings related to Grundsalg DB client'),
      '#weight' => '1',
      '#open' => TRUE,
    );

    // Add front page wrapper.
    $form['wrapper']['use_example_data'] = array(
      '#type' => 'checkbox',
      '#title' => $this->t('Use example data'),
      '#default_value' => $config->get('use_example_data'),
    );

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->config('grundsalg_db_client.settings')
      ->set('use_example_data', $form_state->getValue('use_example_data'))
      ->save();

    parent::submitForm($form, $form_state);
  }
}

