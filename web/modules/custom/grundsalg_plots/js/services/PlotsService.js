/**
 * @file
 * Ticket service to generate ticket to access maps.
 */

angular.module('grundsalg').service('plotsService', ['$http', '$q', 'CacheFactory',
  function ($http, $q, CacheFactory) {
    'use strict';

    var config = drupalSettings.grundsalg_plots;

    // Create cache object (expire 10 min.).
    // @TODO: Make cache configurable in "Site settings".
    if (!CacheFactory.get('plotsCache')) {
      CacheFactory.createCache('plotsCache', {
        maxAge: 600 * 1000,
        deleteOnExpire: 'aggressive',
        storageMode: 'localStorage'
      });
    }
    var plotsCache = CacheFactory.get('plotsCache');

    /**
     * Get plots from the server.
     *
     * @TODO: Handle geoJSON information.
     *
     * @param {number} subdivisionId
     *   The subdivision ID to fetch plots for.
     */
    this.getPlots = function getPlots(subdivisionId) {
      var deferred = $q.defer();

      if (config && config.hasOwnProperty('url')) {
        var url = config.url.replace('%subdivisionId%', subdivisionId);
        var cid = 'plots_' + subdivisionId;

        var plots =  plotsCache.get(cid);
        if (plots !== undefined) {
          deferred.resolve(plots);
        }
        else {
          $http({
            method: 'GET',
            url: url
          }).then(function success(response) {
            var plots = response.data;
            plotsCache.put(cid, plots);

            deferred.resolve(plots);
          }, function error(response) {
            console.error(response);
            deferred.reject('Error communicating with the server.');
          });
        }
      }
      else {
        deferred.reject('No maps end-point URL in configuration');
      }

      return deferred.promise;
    };
  }
]);
