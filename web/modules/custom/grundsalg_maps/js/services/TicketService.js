/**
 * @file
 * Ticket service to generate ticket to access maps.
 */

angular.module('grundsalg').service('ticketService', ['$http', '$q',
  function ($http, $q) {
    'use strict';

    var config = drupalSettings.grundsalg_maps;

    /**
     * Get ticket for KS from the proxy.
     *
     * @returns {string}
     *    The ticket need to access KS.
     */
    this.getTicket = function getTicket() {
      var deferred = $q.defer();

      if (config && config.hasOwnProperty('url')) {
        $http({
          method: 'GET',
          url: config.url + '/api/kfticket'
        }).then(function successCallback(response) {
          deferred.resolve(response.data);
        }, function errorCallback(response) {
          deferred.reject(response.message);
        });
      }
      else {
        deferred.reject('No maps end-point URL in configuration');
      }

      return deferred.promise;
    };
  }
]);
