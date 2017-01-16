/**
 * @file
 * Contains the slideshow component
 */

angular.module('grundsalg').directive('slideshow', function() {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      images: '='
    },
    link: function(scope) {
      scope.currentIndex = 0;

      // Get module path from drupalSettings.
      scope.modulePath = drupalSettings.variables.grundsalg_slideshow_app_dir;

      /**
       * Move to next image in cycle.
       */
      scope.next = function next() {
        scope.currentIndex < scope.images.length - 1 ?
          scope.currentIndex++:
          scope.currentIndex = 0;
      };

      /**
       * Move to previous image in cycle.
       */
      scope.prev = function prev() {
        scope.currentIndex > 0 ?
          scope.currentIndex--:
          scope.currentIndex = scope.images.length - 1;
      };
    },
    templateUrl: drupalSettings.variables.grundsalg_slideshow_app_dir + '/js/templates/images.html'
  };
});