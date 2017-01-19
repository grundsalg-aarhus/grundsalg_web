/**
 * @file
 * Contains the Images Controller.
 */
angular.module('grundsalg').controller('SlideshowController', ['$scope',
    function ($scope) {
      'use strict';

      // Bind images to scope.
      $scope.images = drupalSettings.variables.images;

      console.log($scope.images);
    }
  ]
);