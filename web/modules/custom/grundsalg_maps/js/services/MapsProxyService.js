/**
 * @file
 * FagSystem service to generate ticket to access maps.
 */

angular.module('grundsalg').service('mapsProxyService', ['$http', '$q', 'CacheFactory',
  function ($http, $q, CacheFactory) {
    'use strict';

    var config = drupalSettings.grundsalg_maps;

    if (!CacheFactory.get('mapsProxyCache')) {
      CacheFactory.createCache('mapsProxyCache', {
        maxAge: Number(config.cache_ttl) * 1000,
        deleteOnExpire: 'aggressive',
        storageMode: 'localStorage'
      });
    }
    var mapsProxyCache = CacheFactory.get('mapsProxyCache');

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

        var industries = mapsProxyCache.get(cid);
        if (industries !== undefined) {
          deferred.resolve(industries);
        }
        else {
          $http({
            method: 'GET',
            url: url
          }).then(function success(response) {
            var industries = response.data;
            mapsProxyCache.put(cid, industries);

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

    /**
     * Get institution information.
     *
     * @param {string} type
     *   The type of institution to get.
     */
    this.getInstitutionAsGeoJson = function getInstitutionAsGeoJson(type) {
      var deferred = $q.defer();

      if (config && config.hasOwnProperty('url')) {
        var url = config.url + '/api/bunyt/' + type;
        var cid = 'institution_geojson_' + type;

        var institution = mapsProxyCache.get(cid);
        if (institution !== undefined) {
          deferred.resolve(institution);
        }
        else {
          $http({
            method: 'GET',
            url: url
          }).then(function success(response) {
            var institution = response.data;
            mapsProxyCache.put(cid, institution);

            deferred.resolve(institution);
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
