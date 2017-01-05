/**
 * @file
 * Contains the Images Controller.
 */

angular.module('grundsalg').controller('ImagesController', [
    '$scope',
    function ($scope) {
      // Bind images to scope.
      $scope.images = drupalSettings.variables.images;
    }
  ]
);