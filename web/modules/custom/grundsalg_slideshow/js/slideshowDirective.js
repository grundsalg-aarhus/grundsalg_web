/**
 * @file
 * Contains the slide show component
 */

angular.module('grundsalg').directive('slideshow', function($timeout) {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      images: '='
    },
    link: function(scope) {
      scope.currentIndex = 0;

      // Get module path from drupalSettings.
      scope.modulePath = drupalSettings.grundsalg_slideshow.app_dir;

      // This fixes support for "picture" elements in IE11 and needs to be
      // loaded after the template have been rendered. The timeout ensures that
      // picture-fill is executed in the next digest.
      $timeout(function () {
        picturefill({
          reevaluate: true
        });
      });

      /**
       * Move to next image in cycle.
       */
      scope.next = function next() {
        if (scope.currentIndex < scope.images.length - 1) {
          scope.currentIndex++;
        }
        else {
          scope.currentIndex = 0;
        }
      };

      /**
       * Move to previous image in cycle.
       */
      scope.prev = function prev() {
        if (scope.currentIndex > 0) {
          scope.currentIndex--;
        }
        else {
          scope.currentIndex = scope.images.length - 1;
        }
      };
    },
    templateUrl: drupalSettings.grundsalg_slideshow.app_dir + '/templates/images.html'
  };
});