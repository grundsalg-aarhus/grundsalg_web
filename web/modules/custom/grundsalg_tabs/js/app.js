var app = angular.module('grundsalgTabs', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $locationProvider.hashPrefix('');
  $routeProvider
    .when('/map', {
      templateUrl: drupalSettings.variables.app_dir + '/templates/map.html',
      controller: 'MapController'
    })
    .when('/images', {
      templateUrl: drupalSettings.variables.app_dir + '/templates/images.html',
      controller: 'ImagesController'
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
}]);