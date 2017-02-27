/**
 * @file
 * Contains routing for Tabs.
 */

angular.module('grundsalg').config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {
      'use strict';

      // Configure Hash prefix.
      $locationProvider.hashPrefix('');

      // Setup routes for tabs.
      $routeProvider
      .when('/map', {
        templateUrl: drupalSettings.grundsalg_maps.dir + '/templates/map.html'
      })
      .when('/images', {
        templateUrl: drupalSettings.grundsalg_slideshow.app_dir + '/templates/slideshow.html'
      })
      .when('/video', {
        templateUrl: drupalSettings.grundsalg_tabs.app_dir + '/templates/video.html'
      })
      .when('/streetview', {
        templateUrl: drupalSettings.grundsalg_tabs.app_dir + '/templates/streetview.html'
      })
      .otherwise({
        redirectTo: '/map'
      });
    }
  ]
);