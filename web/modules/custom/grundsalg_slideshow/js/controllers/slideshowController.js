app.controller('SlideshowController', ['$scope', function($scope) {
  $scope.images = drupalSettings.variables.images;
}]);