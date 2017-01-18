/**
 * @file
 * Contains the Map Controller.
 */

angular.module('grundsalg').controller('MapController', ['$scope', '$http',
  function($scope, $http) {
    'use strict';

    console.log('HERHER');

    /**
     * Cookie object.
     *
     * Used to handle the cookie(s), mainly used to store the connection JSON Web Token.
     */
    var Cookie = (function () {
      return function (name) {
        var self = this;

        // Get token from the cookie.
        self.get = function get() {
          var regexp = new RegExp("(?:^" + name + "|\s*" + name + ")=(.*?)(?:;|$)", "g");
          var result = regexp.exec(document.cookie);

          return (result === null) ? undefined : result[1];
        };

        // Set token.
        self.set = function set(value, expire) {
          var cookie = name + '=' + escape(value) + ';';

          // Default expire to one year.
          if (expire === undefined) {
            expire = new Date();
            expire.setTime(expire.getTime() + (365*24*60*60*1000));
          }
          cookie += 'expires=' + expire.toUTCString() + ';';

          cookie += 'path=/;';
          cookie += 'domain=' + document.domain + ';';

          document.cookie = cookie;
        };

        // Remove the cookie by expiring it.
        self.remove = function remove() {
          self.set('', 'Thu, 01 Jan 1970 00:00:00 GMT');
        };
      };
    })();

    function displayMaps(kfticket) {

      proj4.defs("EPSG:25832","+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs");
      var dkProjection = new ol.proj.Projection({
        code: 'EPSG:25832',
        extent: [120000, 5661139.2, 958860.8, 6500000],
        units: 'm'
      });
      ol.proj.addProjection(dkProjection);

      var projection = ol.proj.get("EPSG:25832");
      var projectionExtent = projection.getExtent();
      var resolutions = [1638.4,819.2,409.6,204.8,102.4,51.2,25.6,12.8,6.4,3.2,1.6,.8,.4,.2];
      var matrixIds = ["L00","L01","L02","L03","L04","L05","L06","L07","L08","L09","L10","L11","L12","L13"];

      var layers = [];
      var basemap = new ol.layer.Tile({
        opacity: 1.0,
        source: new ol.source.WMTS({
          url:"https://services.kortforsyningen.dk/topo_skaermkort_daempet?TICKET="+kfticket,
          format: 'image/jpeg',
          matrixSet: 'View1',
          layer: 'dtk_skaermkort_daempet',
          style: 'default',
          tileGrid: new ol.tilegrid.WMTS({
            origin: ol.extent.getTopLeft(projectionExtent),
            resolutions: resolutions,
            matrixIds: matrixIds
          })
        })
      });
      layers.push(basemap);

      // Create map with wms as background layer
      var map = new ol.Map({
        target: 'mapid',
        layers: layers,
        logo: false, // don't display google logo
        controls: ol.control.defaults({}),
        view: new ol.View({
          center: [724500, 6176450],
          zoom: 2, // start zoom
          minZoom: 1,
          maxZoom: 14,
          projection: projection
        })
      });
    }

    var ticket_cookie = new Cookie('kfticket');
    var ticket = ticket_cookie.get();
    var expire = new Date();
    expire.setTime(expire.getTime() + (23*60*60*1000));

    if (ticket === undefined) {
      $http({
        method: 'GET',
        url: 'http://localhost:3010/api/kfticket'
      }).then(function successCallback(response) {
        ticket = response.data;
        ticket_cookie.set(ticket, expire);
        displayMaps(ticket);
      }, function errorCallback(response) {
        console.error(response);
      });
    }
    else {
      displayMaps(ticket);
    }
  }
]);