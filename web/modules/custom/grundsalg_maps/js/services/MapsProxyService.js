/**
 * @file
 * FagSystem service to generate ticket to access maps.
 */

angular.module('grundsalg').service('mapsProxyService', ['$http', '$q', 'CacheFactory',
  function ($http, $q, CacheFactory) {
    'use strict';

    var config = drupalSettings.grundsalg_maps;

    if (!CacheFactory.get('industryCache')) {
      CacheFactory.createCache('industryCache', {
        maxAge: Number(config.cache_ttl) * 1000,
        deleteOnExpire: 'aggressive',
        storageMode: 'localStorage'
      });
    }
    var industryCache = CacheFactory.get('industryCache');

    /**
     * Get geojson information about the plots.
     *
     * @param {number} industryId
     *   The industry ID to fetch information about.
     */
    this.getIndustryAsGeoJson = function getIndustryAsGeoJson(industryId) {
      var deferred = $q.defer();

      if (config && config.hasOwnProperty('url')) {
        var url = config.url + '/api/industry/' + industryId;
        var cid = 'industry_geojson_' + industryId;

        var industries = industryCache.get(cid);
        if (industries !== undefined) {
          deferred.resolve(industries);
        }
        else {
          $http({
            method: 'GET',
            url: url
          }).then(function success(response) {
            var industries = response.data;
            industryCache.put(cid, industries);

            deferred.resolve(industries);
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
