<?php

namespace Grundsalg;

class Collection {

  protected $data;

  protected $items;

  /**
   * Collection constructor.
   * @param array $data
   * @param null $memberClassName
   */
  public function __construct(array $data, $memberClassName = null) {
    $this->data = $data;
    $this->items = [];
    if ($memberClassName) {
      foreach ($this->data['hydra:member'] as $item) {
        $this->items[] = new $memberClassName($item);
      }
    } else {
      $this->items = $this->data;
    }
  }

  /**
   * Get all items from call.
   *
   * @return mixed
   */
  public function getItems() {
    return $this->items;
  }

  /**
   * Count items.
   *
   * @return int
   */
  public function getCount() {
    return count($this->items);
  }

  /**
   * @param $key
   * @return mixed|null
   * @throws \Exception
   */
  public function get($key) {
    switch ($key) {
      case 'first':
      case 'next':
      case 'previous':
      case 'last':
        $hydraKey = 'hydra:' . $key;
        return isset($this->data['hydra:view'][$hydraKey]) ? $this->data['hydra:view'][$hydraKey] : null;
      case 'totalItems':
        $hydraKey = 'hydra:' . $key;
        return isset($this->data[$hydraKey]) ? $this->data[$hydraKey] : null;
    }
    throw new \Exception('No such value: ' . $key);
  }

  /**
   * @param $name
   * @param array $arguments
   * @return mixed|null
   * @throws \Exception
   */
  public function __call($name, array $arguments) {
    if (preg_match('/^get(?<name>.+)/', $name, $matches)) {
      $key = lcfirst($matches['name']);
      try {
        return $this->get($key);
      }
      catch (\Exception $e) {}
    }
    throw new \Exception('Call to undefined method ' . get_class($this) . '::' . $name . '()');
  }
}