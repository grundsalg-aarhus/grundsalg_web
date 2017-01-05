angular.module('grundsalg').controller('showplotsController', ['$scope', '$http', function($scope, $http) {
  var url = drupalSettings.variables.remote_db + '/grunde?id=' + drupalSettings.variables.subdivision_id;
  $scope.displaylimit = 6;
  console.log(drupalSettings);
  if (drupalSettings.variables.use_dummy > 0) {
    url = drupalSettings.variables.dummy_plots;
  }
  $http({
    method: 'GET',
    url: url
  }).then(function successCallback(response) {
    $scope.plots = response.data;
    console.log(response);
  }, function errorCallback(response) {
    console.log('Connection error!');
    console.log(response);
  });
}]);  
