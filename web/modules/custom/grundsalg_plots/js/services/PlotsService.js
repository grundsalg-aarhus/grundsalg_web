/**
 * @file
 * Ticket service to generate ticket to access maps.
 */

angular.module('grundsalg').service('plotsService', ['$http', '$q',
  function ($http, $q) {
    'use strict';

    var config = drupalSettings.grundsalg_plots;


    /**
     * Get plots from the server.
     *
     * @TODO: Handle geoJSON information.
     * @TODO: Add cache.
     *
     * @param {number} subdivisionId
     *   The subdivision ID to fetch plots for.
     */
    this.getPlots = function getPlots(subdivisionId) {
      var deferred = $q.defer();

      if (config && config.hasOwnProperty('url')) {
        var url = config.url.replace('%subdivisionId%', subdivisionId);

        $http({
          method: 'GET',
          url: url
        }).then(function success(response) {
          deferred.resolve(response.data);
        }, function error(response) {
          console.error(response);
          deferred.reject('Error communicating with the server.');
        });
      }
      else {
        deferred.reject('No maps end-point URL in configuration');
      }

      return deferred.promise;
    };
  }
]);
