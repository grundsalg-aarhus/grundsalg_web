/**
 * @file
 * Contains the Video Controller.
 */

angular.module('grundsalg').controller('VideoController', ['$scope', '$sce',
    function ($scope, $sce) {
      'use strict';

      // Set path from the backend.
      $scope.video = drupalSettings.grundsalg_tabs.video;

      // Trust the i-frame for youtube.
      if (drupalSettings.grundsalg_tabs.video) {
        $scope.youtube = $sce.trustAsHtml('<iframe src="//www.youtube.com/embed/' + $scope.video + '?rel=0&showinfo=0" frameborder="0" allowfullscreen></iframe>');
      }
    }
  ]
);