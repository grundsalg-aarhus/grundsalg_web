angular.module('grundsalg').controller('showplotsController', ['$scope', '$http', function($scope, $http) {
  var url = 'http://grundsalg.vm/api/postbies';
  $scope.displaylimit = 6;

  if (drupalSettings.variables.use_dummy > 0) {
    url = drupalSettings.variables.dummy_plots;
  }
  $http({
    method: 'GET',
    url: url
  }).then(function successCallback(response) {
    $scope.plots = response.data;
  }, function errorCallback(response) {
    console.log(response);
  });
}]);  
