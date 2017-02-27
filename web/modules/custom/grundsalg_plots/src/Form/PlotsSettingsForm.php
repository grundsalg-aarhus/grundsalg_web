<?php
/**
 * @file
 * Contains Drupal\grundsalg_maps\Form\MapsSettingsForm.
 */

namespace Drupal\grundsalg_plots\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class PlotsSettingsForm.
 *
 * @package Drupal\grundsalg_maps\Form
 */
class PlotsSettingsForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'plots_settings_form';
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

    $form['plots'] = array(
      '#type' => 'fieldset',
      '#title' => $this->t('Plots settings'),
      '#open' => TRUE,
    );

    $default = $config->get('grundsalg_plots_cache');
    $form['plots']['cache'] = array(
      '#title' => $this->t('Plots cache timeout in seconds'),
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
      'grundsalg_plots_cache' => $form_state->getValue('cache'),
    ));

    drupal_flush_all_caches();
  }

}
