var app = angular.module('grundsalgTabs', ['ngRoute', 'ngAnimate']);

app.directive('slider', function() {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      images: '='
    },
    link: function(scope) {
      scope.currentIndex = 0;
      scope.modulepath = drupalSettings.variables.app_dir + "/..";

      scope.next = function() {
        scope.currentIndex < scope.images.length-1 ? scope.currentIndex++ : scope.currentIndex = 0;
      };

      scope.prev = function() {
        scope.currentIndex > 0 ? scope.currentIndex-- : scope.currentIndex = scope.images.length-1;
      };

      scope.$watch('currentIndex',function() {
        scope.images.forEach(function(image) {
          image.visible = false;
        });
        scope.images[scope.currentIndex].visible = true;
      });
    },
    templateUrl: drupalSettings.variables.app_dir + '/templates/slideshowImage.html'
  };
});

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