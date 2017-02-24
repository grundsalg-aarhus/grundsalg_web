<?php
/**
 * @file
 * Contains Drupal\grundsalg_front\Form\GrundsalgFrontSettingsForm.
 */

namespace Drupal\grundsalg_front\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class GrundsalgFrontSettingsForm
 *
 * @package Drupal\grundsalg_front\Form
 */
class GrundsalgFrontSettingsForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'grundsalg_front_settings';
  }

  /**
   * Get key/value storage for base config.
   *
   * @return object
   *   The config object.
   */
  private function getBaseConfig() {
    return \Drupal::getContainer()->get('itkore_admin.itkore_config');
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->getBaseConfig();

    $form['villa'] = array(
      '#type' => 'details',
      '#title' => $this->t('Villa'),
      '#open' => TRUE,
    );

    $form['parcel'] = array(
      '#type' => 'details',
      '#title' => $this->t('Parcel'),
      '#open' => TRUE,
    );

    $form['industry'] = array(
      '#type' => 'details',
      '#title' => $this->t('Industry'),
      '#open' => TRUE,
    );

    $form['villa']['villa_header'] = array(
      '#title' => $this->t('Villa Header'),
      '#type' => 'textfield',
      '#default_value' => $config->get('villa_header'),
      '#weight' => '1',
      '#size' => 60,
      '#maxlength' => 128,
    );

    $form['villa']['villa_text'] = array(
      '#title' => $this->t('Villa text'),
      '#type' => 'textfield',
      '#default_value' => $config->get('villa_text'),
      '#weight' => '1',
      '#size' => 60,
      '#maxlength' => 128,
    );

    $form['parcel']['parcel_header'] = array(
      '#title' => $this->t('Parcel Header'),
      '#type' => 'textfield',
      '#default_value' => $config->get('parcel_header'),
      '#weight' => '1',
      '#size' => 60,
      '#maxlength' => 128,
    );

    $form['parcel']['parcel_text'] = array(
      '#title' => $this->t('Parcel text'),
      '#type' => 'textfield',
      '#default_value' => $config->get('parcel_text'),
      '#weight' => '1',
      '#size' => 60,
      '#maxlength' => 128,
    );

    $form['industry']['industry_header'] = array(
      '#title' => $this->t('Industry Header'),
      '#type' => 'textfield',
      '#default_value' => $config->get('industry_header'),
      '#weight' => '1',
      '#size' => 60,
      '#maxlength' => 128,
    );

    $form['industry']['industry_text'] = array(
      '#title' => $this->t('Industry text'),
      '#type' => 'textfield',
      '#default_value' => $config->get('industry_text'),
      '#weight' => '1',
      '#size' => 60,
      '#maxlength' => 128,
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
      'villa_header' => $form_state->getValue('villa_header'),
      'villa_text' => $form_state->getValue('villa_text'),
      'parcel_header' => $form_state->getValue('parcel_header'),
      'parcel_text' => $form_state->getValue('parcel_text'),
      'industry_header' => $form_state->getValue('industry_header'),
      'industry_text' => $form_state->getValue('industry_text'),
    ));

    drupal_flush_all_caches();
  }

}
