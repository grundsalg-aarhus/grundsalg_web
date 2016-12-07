angular.module('grundsalgTabs').controller('VideoController', ['$scope', function($scope) {

  // Set paths from the backend.
  $scope.url = drupalSettings.variables.url;

}]);