<?php

use Drupal\taxonomy\Entity\Vocabulary;
use Drupal\taxonomy\Entity\Term;

/**
 * Implements hook_drush_command().
 */
function grundsalg_setup_drush_command() {
  $items['grundsalg-import-cities'] = array(
    'description' => 'Imports postal code, cities terms.',
    'aliases' => array('gic'),
  );

  return $items;
}


/**
 * Callback for the drush-import-cities command
 */
function drush_grundsalg_setup_grundsalg_import_cities() {
  $host = \Drupal::request()->getHost();

  // Create array from csv file.
  $aarhus_elements = array();
  $file_path = __DIR__. '/city-postal.csv';
  $row = 1;
  if (($handle = fopen($file_path, "r")) !== FALSE) {
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
      $aarhus_elements[$data['0']] =  $data['1'];
      $row++;
    }
    fclose($handle);
  }

  // Create array from existing terms in cities vocabulary.
  $vids = Vocabulary::loadMultiple();
  $existing_terms = array();
  foreach ($vids as $vid) {
    if ($vid->id() == 'cities') {
      $container = \Drupal::getContainer();
      $terms = $container->get('entity.manager')->getStorage('taxonomy_term')->loadTree($vid->id(), $parent = 0, $max_depth = NULL, $load_entities = TRUE);
      foreach ($terms as $key => $term) {
        $existing_terms[$term->field_postalcode->getValue()['0']['value']] = $term->name->getValue()['0']['value'];
      }
    }
  }

  // Create terms.
  $terms_created = FALSE;
  foreach ($aarhus_elements as $postalcode => $city) {
    // If terms vocabulary exists.
    if (isset($terms)) {
      // If vocabulary exists but term not found.
      if (!in_array($city, $existing_terms)) {
        Term::create([
          'name' => $city,
          'vid' => 'cities',
          'field_postalcode' => $postalcode,
        ])->save();
        $terms_created = TRUE;
        drupal_set_message('Term: ' . $city . ' : ' . $postalcode . ' was created.');
      }
    }
    // If no terms exist yet import all.
    else {
      Term::create([
        'name' => $city,
        'vid' => 'cities',
        'field_postalcode' => $postalcode,
      ])->save();
      $terms_created = TRUE;
      drupal_set_message('Term: ' . $city . ' : ' . $postalcode . ' was created.');
    }
  }

  if ($terms_created == FALSE) {
    drupal_set_message(t('No terms created'));
  }
}
