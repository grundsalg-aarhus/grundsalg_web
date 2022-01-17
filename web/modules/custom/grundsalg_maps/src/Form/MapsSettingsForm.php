<?php
/**
 * @file
 * Contains Drupal\grundsalg_maps\Form\MapsSettingsForm.
 */

namespace Drupal\grundsalg_maps\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class GrundsalgFrontSettingsForm.
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
   *   The configuration object.
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

    $form['maps'] = array(
      '#type' => 'details',
      '#title' => $this->t('Maps settings'),
      '#open' => TRUE,
    );

    $default = $config->get('grundsalg_maps_username');
    $form['maps']['username'] = array(
      '#title' => $this->t('Username'),
      '#description' => $this->t('Datafordeler username (service bruger as this will be exposed in the browser).'),
      '#type' => 'textfield',
      '#default_value' => isset($default) ? $default : '',
      '#weight' => '1',
      '#size' => 20,
    );

    $default = $config->get('grundsalg_maps_password');
    $form['maps']['password'] = array(
      '#title' => $this->t('Password'),
      '#description' => $this->t('Datafordeler password'),
      '#type' => 'textfield',
      '#default_value' => isset($default) ? $default : '',
      '#weight' => '1',
      '#size' => 21,
    );

    $default = $config->get('grundsalg_maps_areas_cache');
    $form['maps']['cache'] = array(
      '#title' => $this->t('Areas cache timeout in seconds'),
      '#description' => $this->t('Default is 300. Set it to "0" to disable cache.'),
      '#type' => 'textfield',
      '#default_value' => isset($default) ? $default : 300,
      '#weight' => '1',
      '#size' => 20,
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
      'grundsalg_maps_areas_cache' => $form_state->getValue('cache'),
      'grundsalg_maps_username' => $form_state->getValue('username'),
      'grundsalg_maps_password' => $form_state->getValue('password'),
    ));

    drupal_flush_all_caches();
  }

}
