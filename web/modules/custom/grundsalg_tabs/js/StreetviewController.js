/**
 * @file
 * Contains the Streetview Controller.
 */

angular.module('grundsalg').controller('StreetviewController', [
    '$scope',
    function ($scope) {
      'use strict';

      /**
       * Initialize the street view.
       */
      function initialize() {
        angular.element(document).ready(function ready() {
          var sv = new google.maps.StreetViewService();
          var location = {
            lat: Number(drupalSettings.variables.coordinates.lat),
            lng: Number(drupalSettings.variables.coordinates.lon)
          };

          sv.getPanorama({
            location: location,
            radius: 500
          }, function processSVData(data, status) {
            if (status === 'OK') {
              var panorama = new google.maps.StreetViewPanorama(document.getElementById('street-view'));
              panorama.setPano(data.location.pano);
              panorama.setPov({
                heading: 150,
                pitch: 0
              });
              panorama.setVisible(true);

            }
            else {
              document.getElementById('street-view').innerHTML = 'Street View data not found for this location.';
            }
          });

        });
      }

      initialize();
    }
  ]
);