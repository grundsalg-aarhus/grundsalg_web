<?php
namespace Grundsalg\Item;

abstract class Item
{
  protected $data;
  public function __construct(array $data)
  {
    $this->data = $data;
    $this->data['id'] = $this->data['@id'];
    if (preg_match('/(\d+)$/', $this->data['@id'], $matches)) {
      $this->data['itemId'] = $matches[1];
    }
  }
  /**
   * Get the item id.
   *
   * @return int
   */
  public function getItemId()
  {
    return $this->get('itemId') ?: 0;
  }
  /**
   * Set a value from in item data.
   *
   * @param string $key
   * @param mixed $value
   * @return Item
   */
  public function set($key, $value)
  {
    $this->data[$key] = $value;
    return $this;
  }
  /**
   * Get a value from the item data.
   *
   * @param null $key
   * @return array|mixed|null
   */
  public function get($key = null)
  {
    return $key ? (isset($this->data[$key]) ? $this->data[$key] : null) : $this->data;
  }
  public function __set($name, $value)
  {
    $this->data[$name] = $value;
  }
  public function __get($name)
  {
    return isset($this->data[$name]) ? $this->data[$name] : null;
  }
  public function __call($name, array $arguments)
  {
    if (preg_match('/^(?:get)?(?<name>.+)/', $name, $matches)) {
      $key = lcfirst($matches['name']);
      if (array_key_exists($key, $this->data)) {
        return $this->data[$key];
      }
    }
    throw new \Exception('Call to undefined method ' . get_class($this) . '::' . $name . '()');
  }
}