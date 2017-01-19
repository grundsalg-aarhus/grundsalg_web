/**
 * @file
 * Contains controller for showing plots.
 */

angular.module('grundsalg').controller('ShowPlotsController', ['$scope', '$http',
    function ($scope, $http) {
      'use strict';

      // Number of displayed plots.
      $scope.displayLimit = 6;

      // Get subdivision id.
      var subdivisionId = drupalSettings.variables.subdivision_id;

      // If field exists.(On node form).
      if (document.getElementsByName('field_subdivision_id[0][value]')['0']) {
        subdivisionId = document.getElementsByName('field_subdivision_id[0][value]')[0].value;
      }

      // Remote url.
      var url = drupalSettings.variables.remote_db + '/udstykning/' + subdivisionId + '/grunde';

      // Fetch plots based on url
      fetch(url);

      // Fetch plots function (Button click on node form)
      $scope.fetchPlots = function(url) {
        // If field exists.(On node form)
        if (document.getElementsByName('field_subdivision_id[0][value]')[0]) {
          // Set subdivision id to field value.
          var subdivisionId = document.getElementsByName('field_subdivision_id[0][value]')[0].value;

          // Change the url.
          url = drupalSettings.variables.remote_db + '/udstykning/' + subdivisionId + '/grunde';

          // Fetch plots based on url
          fetch(url);
        }
      };

      // Fetch function. Handles the actual request
      function fetch(url) {
        if (drupalSettings.variables.use_dummy > 0) {
          url = drupalSettings.variables.dummy_plots;
        }
        $http({
          method: 'GET',
          url: url
        }).then(
          function successCallback(response) {
            $scope.plots = response.data['grunde'];
          },
          function errorCallback(response) {
            // @TODO: How should this be handled?
            console.log('Connection error!');
            console.log(response);
          }
        );
      }
    }
  ]
);
