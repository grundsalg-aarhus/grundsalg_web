angular.module('grundsalgTabs').controller('ImagesController', ['$scope', function($scope) {

  // Set paths from the backend.
  $scope.alt = drupalSettings.variables.images['0'].alt;
  $scope.url = drupalSettings.variables.images['0'].url;
}]);