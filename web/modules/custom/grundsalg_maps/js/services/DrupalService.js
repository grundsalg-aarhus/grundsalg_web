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
        maxAge: Number(config.cache_ttl) * 1000,
        deleteOnExpire: 'aggressive',
        storageMode: 'localStorage'
      });
    }
    var drupalCache = CacheFactory.get('drupalCache');

    /**
     * Get areas for a given type.
     *
     * @param {int} plot_type
     *   The type of areas to fetch.
     */
    this.getAreas = function getAreas(plot_type) {
      var deferred = $q.defer();

      var cid = 'drupalCache_areas_' + plot_type;

      var areas =  drupalCache.get(cid);
      if (areas !== undefined) {
        deferred.resolve(areas);
      }
      else {
        $http({
          method: 'GET',
          url: '/api/maps/areas/' + plot_type
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

    /**
     * Get subdivisions.
     *
     * @param {int} plot_type
     *   The area type to limit by.
     * @param {int} area_id
     *   The area to get subdivision for.
     */
    this.getSubdivisions = function getSubdivisions(plot_type, area_id) {
      var deferred = $q.defer();

      var cid = 'drupalCache_subdivision_' + plot_type + '_' + area_id;

      var areas =  drupalCache.get(cid);
      if (areas !== undefined) {
        deferred.resolve(areas);
      }
      else {
        $http({
          method: 'GET',
          url: '/api/maps/area/' + plot_type + '/subdivision/' + area_id
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

    /**
     * Get projects.
     */
    this.getProjects = function getProjects() {
      var deferred = $q.defer();

      var cid = 'drupalCache_projects';

      var areas =  drupalCache.get(cid);
      if (areas !== undefined) {
        deferred.resolve(areas);
      }
      else {
        $http({
          method: 'GET',
          url: '/api/maps/projects'
        }).then(function success(response) {
          var projects = response.data;
          drupalCache.put(cid, projects);

          deferred.resolve(projects);
        }, function error(response) {
          console.error(response);
          deferred.reject('Error communicating with the server.');
        });
      }

      return deferred.promise;
    };

    /**
     * Get the faded municipalities borders as geoJson.
     */
    this.getMunicipalities = function getMunicipalities() {
      var deferred = $q.defer();

      var cid = 'drupalCache_municipalities';

      var areas =  drupalCache.get(cid);
      if (areas !== undefined) {
        deferred.resolve(areas);
      }
      else {
        $http({
          method: 'GET',
          url: '/modules/custom/grundsalg_maps/data/kommuner.json'
        }).then(function success(response) {
          var data = response.data;
          drupalCache.put(cid, data);

          deferred.resolve(data);
        }, function error(response) {
          console.error(response);
          deferred.reject('Error communicating with the server.');
        });
      }

      return deferred.promise;
    }
  }]
);