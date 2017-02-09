/**
 * @file
 * Service to access cookies.
 */
angular.module('grundsalg').service('drupalService', ['$http', '$q', 'CacheFactory',
  function ($http, $q, CacheFactory) {
    'use strict';

    var config = drupalSettings.grundsalg_maps;

    if (!CacheFactory.get('drupalCache')) {
      CacheFactory.createCache('drupalCache', {
        maxAge: Number(config.cache_ttl),
        deleteOnExpire: 'aggressive',
        storageMode: 'localStorage'
      });
    }
    var drupalCache = CacheFactory.get('drupalCache');

    this.getAreas = function getAreas(plot_type) {
      var deferred = $q.defer();

      var cid = 'drupalCache_areas';

      var areas =  drupalCache.get(cid);
      if (areas !== undefined) {
        deferred.resolve(areas);
      }
      else {
        $http({
          method: 'GET',
          url: '/api/maps/areas/' + config.plot_type
        }).then(function success(response) {
          var areas = response.data;
          drupalCache.put(cid, areas);

          deferred.resolve(areas);
        }, function error(response) {
          console.error(response);
          deferred.reject('Error communicating with the server.');
        });
      }

      return deferred.promise;
    };
  }]
);