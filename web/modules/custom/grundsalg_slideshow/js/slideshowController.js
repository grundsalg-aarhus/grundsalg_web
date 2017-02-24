/**
 * @file
 * Contains the Images Controller.
 */

angular.module('grundsalg').controller('SlideshowController', ['$scope',
    function ($scope) {
      'use strict';

      // Bind images to scope.
      $scope.images = drupalSettings.grundsalg_slideshow.images;
    }
  ]
);