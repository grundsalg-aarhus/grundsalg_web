<?php

namespace Grundsalg;

require_once __DIR__ . '/Exception/ClientException.php';

use GuzzleHttp\Client as GuzzleHttpClient;
use GuzzleHttp\Exception\ClientException as GuzzleClientException;
use Drupal\grundsalg_db_client\ClientException;
use GuzzleHttp\Exception\ConnectException as GuzzleConnectException;


class Client {
  protected $url;
  protected $username;
  protected $password;
  protected $token;

  /**
   * Client constructor.
   *
   * @param $url The API url.
   * @param $username The API username.
   * @param $password The API password.
   */
  public function __construct($url, $username, $password) {
    $this->url = rtrim($url, '/') . '/';
    $this->username = $username;
    $this->password = $password;
  }


  /**
   * Get all plots.
   * 
   * @param array|NULL $query
   * @return \Grundsalg\Collection
   */
  public function getPlots(array $query = null) {
    $url = $this->getUrl('postbies', $query);
    $res = $this->request('GET', $url);
    $json = json_decode($res->getBody(), true);
    $collection = new Collection($json);
    
    return $collection;
  }
  
  /**
   * Get db url.
   *
   * @param $url
   * @param array|NULL $query
   * @return string
   */
  private function getUrl($url, array $query = null) {
    if ($query) {
      $url .= '?' . http_build_query($query);
    }
    return $url;
  }
  
  /**
   * @param $method
   * @param $url
   * @param array $data
   * @return mixed|\Psr\Http\Message\ResponseInterface
   * @throws \Drupal\grundsalg_db_client\ClientException
   */
  private function request($method, $url, array $data = []) {
    return $this->doRequest($method, $url, $data);
  }

  /**
   * @param $method
   * @param $url
   * @param array $data
   * @return mixed|\Psr\Http\Message\ResponseInterface
   * @throws \Drupal\grundsalg_db_client\ClientException
   */
  private function doRequest($method, $url, array $data) {
    try {
      $client = new GuzzleHttpClient([
        'base_uri' => $this->url,
      ]);
      $res = $client->request($method, $url, $data);
      return $res;
    } catch (\Exception $e) {
      throw new ClientException($e->getMessage(), $e->getCode(), $e);
    }
  }
}