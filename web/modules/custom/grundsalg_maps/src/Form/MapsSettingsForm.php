<?php
/**
 * @file
 * Contains Drupal\grundsalg_maps\Form\MapsSettingsForm.
 */

namespace Drupal\grundsalg_maps\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class GrundsalgFrontSettingsForm
 *
 * @package Drupal\grundsalg_maps\Form
 */
class MapsSettingsForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'maps_settings_form';
  }

  /**
   * Get key/value storage for base config.
   *
   * @return object
   */
  private function getBaseConfig() {
    return \Drupal::getContainer()->get('itkore_admin.itkore_config');
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->getBaseConfig();

    $form['proxy'] = array(
      '#type' => 'details',
      '#title' => $this->t('Proxy settings'),
      '#open' => TRUE,
    );

    $form['proxy']['url'] = array(
      '#title' => $this->t('Proxy end-point url'),
      '#type' => 'textfield',
      '#default_value' => $config->get('grundsalg_maps_url'),
      '#weight' => '1',
      '#size' => 60,
    );

    $form['submit'] = array(
      '#type' => 'submit',
      '#value' => t('Save changes'),
      '#weight' => '6',
    );

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    drupal_set_message('Settings saved');

    // Set the configuration values.
    $this->getBaseConfig()->setMultiple(array(
      'grundsalg_maps_url' => $form_state->getValue('url'),
      'grundsalg_maps_apikey' => $form_state->getValue('api-key'),
    ));

    drupal_flush_all_caches();
  }
}

