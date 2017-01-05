<?php

namespace Grundsalg;

class Dummy {

  /**
   * Dummy constructor.
   *
   * @param array $data
   */
  public function __construct(array $items) {
    $this->items = $items;
  }


  /**
   * Get all plots.
   * 
   * @return \Grundsalg\Dummy
   */
  public function getPlots(array $query = null) {
    $string = file_get_contents(__DIR__ . "/../example_data/example-subdivision-plots.json");
    $json = json_decode($string, true);
    $dummy = new Dummy($json);

    return $dummy;
  }
}