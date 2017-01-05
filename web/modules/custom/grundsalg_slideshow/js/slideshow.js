/**
 * @file
 * Contains the slideshow component
 */

/**
 * Setup the module.
 */

var app;
app = angular.module('grundsalgSlideshow', []);

/**
 * Slideshow component directive.
 *
 * html parameters:
 */
app.directive('slideshow', function() {
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
        if (scope.images) {
          scope.images.forEach(function(image) {
            image.visible = false;
          });
          scope.images[scope.currentIndex].visible = true;
        }
      });
    },
    templateUrl: drupalSettings.variables.app_dir + '/templates/images.html'
  };
});