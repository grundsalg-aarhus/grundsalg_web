angular.module('grundsalgTabs').controller('StreetviewController', ['$scope', function($scope) {
  // Set coordiantes from the backend.
  $scope.coordinates = drupalSettings.variables.coordinates;
  var panorama;
  
  function initialize() {
    panorama = new google.maps.StreetViewPanorama(
      document.getElementById('street-view'),
      {
        position: {lat: parseFloat(drupalSettings.variables.coordinates['lat']), lng: parseFloat(drupalSettings.variables.coordinates['lon'])},
        pov: {heading: 165, pitch: 0},
        zoom: 1
      });
  }
  if ($scope.coordinates) {
    initialize();
  }
}]);