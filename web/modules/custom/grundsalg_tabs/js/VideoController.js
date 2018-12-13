/**
 * @file
 * Contains the Video Controller.
 */

angular.module('grundsalg').controller('VideoController', ['$scope', '$timeout',
    function ($scope, $timeout) {
      'use strict';

      // Set path from the backend.
      $scope.video = drupalSettings.grundsalg_tabs.video;

      $timeout(function () {
        var player = dashjs.MediaPlayer().create();
        var element = document.querySelector(".itk-azure-video > video");

        player.initialize(element, element.src, false);
      }, 500);
    }
  ]
);
