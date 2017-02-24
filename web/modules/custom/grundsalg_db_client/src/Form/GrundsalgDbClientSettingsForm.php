<?php
/**
 * @file
 * Contains Drupal\itkore_admin\Form\ItkoreSettingsForm.
 */

namespace Drupal\grundsalg_db_client\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class GrundsalgDbClientSettingsForm.
 *
 * @package Drupal\itkore_admin\Form
 */
class GrundsalgDbClientSettingsForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'grundsalg_db_client_settings';
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

    // Add front page wrapper.
    $form['example'] = array(
      '#title' => $this->t('Use example data from JSON'),
      '#type' => 'fieldset',
      '#weight' => '1',
      '#open' => TRUE,
    );

    // Add front page wrapper.
    $form['example']['use_example_data'] = array(
      '#type' => 'checkbox',
      '#title' => $this->t('Use example data'),
      '#default_value' => $config->get('grundsalg_db_client_use_example_data'),
    );

    // If "grundsalg_db_client_example_file" has not been set, use default.
    $path = drupal_get_path('module', 'grundsalg_db_client') . '/example_data/example-subdivision-plots.json';
    $form['example']['file'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('JSON file'),
      '#description' => $this->t('The location of the example data file'),
      '#default_value' => $config->get('grundsalg_db_client_example_file') ? $config->get('grundsalg_db_client_example_file') : $path,
      '#size' => 60,
      '#states' => array(
        'visible' => array(
          ':input[name="use_example_data"]' => array('checked' => TRUE),
        ),
      ),
    );

    $form['fs'] = array(
      '#title' => $this->t('Database settings (fagsystem)'),
      '#type' => 'fieldset',
      '#weight' => '1',
      '#open' => TRUE,
      '#states' => array(
        'invisible' => array(
          ':input[name="use_example_data"]' => array('checked' => TRUE),
        ),
      ),
    );

    $form['fs']['url'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('URL'),
      '#description' => $this->t('Grundslag fagsystem end-point URL'),
      '#default_value' => $config->get('grundsalg_db_client_url'),
      '#size' => 60,
      '#states' => array(
        'invisible' => array(
          ':input[name="use_example_data"]' => array('checked' => TRUE),
        ),
      ),
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
      'grundsalg_db_client_use_example_data' => $form_state->getValue('use_example_data'),
      'grundsalg_db_client_example_file' => $form_state->getValue('file'),
      'grundsalg_db_client_url' => $form_state->getValue('url'),
    ));

    drupal_flush_all_caches();
  }
}
