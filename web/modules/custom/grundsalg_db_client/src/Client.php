<?php

namespace Grundsalg;

use GuzzleHttp\Client as GuzzleHttpClient;
use GuzzleHttp\Exception\ClientException as GuzzleClientException;
use Drupal\grundsalg_db_client\ClientException;
use Lcobucci\JWT\Parser;


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
   * Get all postal codes.
   *
   * @param array $query
   *   The event query.
   *
   * @return Collection
   *   A event collection.
   */
  public function getPostalCodes(array $query = null) {
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
    $this->checkToken();
    if ($this->token) {
      $data['headers'] = ['Authorization' => 'Bearer ' . $this->token];
    }
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
    } catch (GuzzleClientException $e) {
      throw new ClientException($e->getMessage(), $e->getCode(), $e);
    }
  }

  /**
   * Renew token if outdated.
   *
   * @throws \Drupal\grundsalg_db_client\ClientException
   */
  private function renewToken() {
    $res = $this->doRequest('POST', 'login_check', [
      'form_params' => [
        '_username' => $this->username,
        '_password' => $this->password,
      ],
    ]);
    $data = $res->getStatusCode() === 200 ? json_decode($res->getBody()) : null;
    if (!$data) {
      throw new ClientException('Cannot renew token', 401);
    }
    $this->token = $data->token;
    $this->writeToken();
  }

  /**
   * Locate api token file
   *
   * @return string
   */
  private function getTokenFile() {
    $filename = md5($this->url . '|' . $this->username . '|' . $this->password) . '.apitoken';
    return sys_get_temp_dir() . '/' . $filename;
  }


  /**
   * Write token to file
   */
  private function writeToken() {
    file_put_contents($this->getTokenFile(), $this->token);
  }

  /**
   * Read token file.
   */
  private function readToken() {
    $this->token = file_exists($this->getTokenFile()) ? file_get_contents($this->getTokenFile()) : null;
  }


  /**
   * Analyse token file.
   *
   * @throws \Drupal\grundsalg_db_client\ClientException
   */
  private function checkToken() {
    if (!$this->username) {
      $this->token = null;
      return;
    }

    $this->readToken();
    if (!$this->token) {
      $renew = true;
    }
    else {
      try {
        $token = (new Parser())->parse((string)$this->token);
        $expirationTime = new \DateTime();
        $timestamp = $token->getClaim('exp');
        $expirationTime->setTimestamp($timestamp);
        $renew = $expirationTime < new \DateTime();
      }
      catch (\Exception $e) {
        $renew = true;
      }
    }
    if ($renew) {
      $this->renewToken();
    }
  }
}