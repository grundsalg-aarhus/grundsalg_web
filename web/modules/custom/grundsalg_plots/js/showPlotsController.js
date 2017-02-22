/**
 * @file
 * Contains controller for showing plots.
 */

angular.module('grundsalg').controller('ShowPlotsController', ['$scope', '$http', 'plotsService',
    function ($scope, $http, plotsService) {
      'use strict';

      // Get configuration from drupal settings.
      var config = drupalSettings.grundsalg_plots;

      // Get subdivision id.
      var subdivisionId = config.subdivision_id;

      // Number of displayed plots.
      $scope.displayLimit = 6;

      // Fetch plots based on url.
      plotsService.getPlots(subdivisionId).then(function (plots) {
        $scope.plots = plots['grunde'];
      }, function (err) {
        // @TODO: Display message to user.
        console.error(err);
      });
    }
  ]
);
