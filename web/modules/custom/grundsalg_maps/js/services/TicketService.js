
angular.module('grundsalg').service('ticketService', ['$http',
  function ($http) {
    'use strict';

    var config = drupalSettings.grundsalg_maps;

    /**
     * Get ticket for KS from the proxy.
     *
     * @returns {string}
     *    The ticket need to access KS.
     */
    this.getTicket = function getTicket() {
      var ticket = null;

      if (config && config.hasOwnProperty('url')) {
        $http({
          method: 'GET',
          url: config.url + '/api/kfticket'
        }).then(function successCallback(response) {
          ticket = response.data;
        }, function errorCallback(response) {
          console.error(response);
        });
      }
      else {
        console.error('No maps end-point URL in configuration');
      }

      return ticket;
    };
  }
]);
