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
        templateUrl: drupalSettings.grundsalg_maps.dir + '/templates/map.html',
        activetab: 'map'
      })
      .when('/images', {
        templateUrl: drupalSettings.grundsalg_slideshow.app_dir + '/templates/slideshow.html',
        activetab: 'images'
      })
      .when('/video', {
        templateUrl: drupalSettings.grundsalg_tabs.app_dir + '/templates/video.html',
        activetab: 'video'
      })
      .when('/streetview', {
        templateUrl: drupalSettings.grundsalg_tabs.app_dir + '/templates/streetview.html',
        activetab: 'streetview'
      })
      .otherwise({
        redirectTo: '/map',
        activetab: 'map'
      });
    }
  ]
).run(['$rootScope', '$location', function($rootScope, $location){
  var path = function() { return $location.path();};
  $rootScope.$watch(path, function(newVal, oldVal){
    $rootScope.activetab = newVal;
  });
}]);