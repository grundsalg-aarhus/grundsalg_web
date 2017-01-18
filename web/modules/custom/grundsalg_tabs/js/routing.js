/**
 * @file
 * Contains routing for Tabs.
 */

angular.module('grundsalg').config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {
      'use strict';

      // Configure Hash prefix.
      $locationProvider.hashPrefix('');

      // Setup routes.
      $routeProvider
      .when('/map', {
        templateUrl: drupalSettings.variables.grundsalg_maps_app_dir + '/templates/map.html',
        controller: 'MapController'
      })
      .when('/images', {
        templateUrl: drupalSettings.variables.grundsalg_slideshow_app_dir + '/templates/slideshow.html',
        controller: 'SlideshowController'
      })
      .when('/video', {
        templateUrl: drupalSettings.variables.app_dir + '/templates/video.html',
        controller: 'VideoController'
      })
      .when('/streetview', {
        templateUrl: drupalSettings.variables.app_dir + '/templates/streetview.html',
        controller: 'StreetviewController'
      })
      .otherwise({
        redirectTo: '/map'
      });
    }
  ]
);