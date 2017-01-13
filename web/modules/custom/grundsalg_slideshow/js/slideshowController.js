/**
 * @file
 * Contains the Images Controller.
 */

angular.module('grundsalg').controller('SlideshowController', [
    '$scope',
    function ($scope) {
      // Bind images to scope.
      $scope.images = drupalSettings.variables.images;
    }
  ]
);