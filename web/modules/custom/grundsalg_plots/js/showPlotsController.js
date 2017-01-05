/**
 * @file
 * Contains controller for showing plots.
 */

angular.module('grundsalg').controller('ShowPlotsController', [
    '$scope', '$http',
    function ($scope, $http) {
      // Number of displayed plots.
      $scope.displayLimit = 6;

      // Url to get plots from.
      var url = drupalSettings.variables.remote_db;

      // @TODO: Weird check, should not have to be in the angular code.
      if (drupalSettings.variables.use_dummy > 0) {
        url = drupalSettings.variables.dummy_plots;
      }

      $http({
        method: 'GET',
        url: url
      }).then(
        function successCallback(response) {
          $scope.plots = response.data;
        },
        function errorCallback(response) {
          // @TODO: How should this be handled?
          console.log('Connection error!');
          console.log(response);
        });
    }
  ]
);
