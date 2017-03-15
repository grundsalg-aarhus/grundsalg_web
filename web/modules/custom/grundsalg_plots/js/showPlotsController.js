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

    // Defined weight that is used to sort the plots based on status.
    var weight = {
      'I udbud': 0,
      'Ledig': 1,
      'Reserveret': 2,
      'Solgt': 3,
      'Fremtidig': 4
    };

    /**
     * Compare function used to sort array based on weight.
     */
    function compareStatus(a, b) {
      if (weight[a.status] < weight[b.status]) {
        return -1;
      }
      if (weight[a.status] > weight[b.status]) {
        return 1;
      }

      return 0;
    }

    // Fetch plots based on url.
    plotsService.getPlots(subdivisionId).then(function (data) {
      // Sort plots based on their status: I udbud, Ledig, Reserveret, Solgt,
      // Fremtidig.
      var plots = data['grunde'];
      plots.sort(compareStatus);
      $scope.plots = plots;
    }, function (err) {
      // @TODO: Display message to user.
      console.error(err);
    });
  }
]);
