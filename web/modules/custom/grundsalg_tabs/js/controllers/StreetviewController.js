angular.module('grundsalgTabs').controller('StreetviewController', ['$scope', function($scope) {

  // Set paths from the backend.
  $scope.coordinates = drupalSettings.variables.coordinates;

}]);