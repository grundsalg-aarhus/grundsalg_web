angular.module('grundsalg').controller('ImagesController', ['$scope', function($scope) {
  $scope.images = drupalSettings.variables.images;
}]);