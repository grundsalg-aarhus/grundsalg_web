angular.module('grundsalgTabs').controller('ImagesController', ['$scope', function($scope) {
  $scope.images = drupalSettings.variables.images;
}]);