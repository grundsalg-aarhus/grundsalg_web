/**
 * @file
 * Contains the Streetview Controller.
 */

angular.module('grundsalg').controller('StreetviewController', ['$scope',
    function ($scope) {
      'use strict';

      /**
       * Initialize the street view.
       */
      function initialize() {
        angular.element(document).ready(function ready() {
          var sv = new google.maps.StreetViewService();

          // Location from the node in drupal.
          var location = {
            lat: Number(drupalSettings.grundsalg_tabs.coordinates.lat),
            lng: Number(drupalSettings.grundsalg_tabs.coordinates.lon)
          };

          // @TODO: Is the radius 1500 meters or km?
          // Get a street view as close as possible with in 1500 km.
          sv.getPanorama({
            location: location,
            radius: 1500
          }, function processSVData(data, status) {
            if (status === 'OK') {
              var panorama = new google.maps.StreetViewPanorama(document.getElementById('street-view'));
              panorama.setPano(data.location.pano);
              panorama.setPov({
                heading: 0,
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