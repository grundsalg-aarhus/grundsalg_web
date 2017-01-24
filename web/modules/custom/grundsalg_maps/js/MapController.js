/**
 * @file
 * Contains the Map Controller.
 */

angular.module('grundsalg').controller('MapController', ['$scope', '$http', 'ticketService',
  function($scope, ticketService) {
    'use strict';

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
          url: 'https://services.kortforsyningen.dk/topo_skaermkort?ticket=' + kfticket,
          format: 'image/jpeg',
          matrixSet: 'View1',
          layer: 'dtk_skaermkort',
          style: 'default',
          tileGrid: new ol.tilegrid.WMTS({
            origin: ol.extent.getTopLeft(projectionExtent),
            resolutions: resolutions,
            matrixIds: matrixIds
          })
        })
      });
      layers.push(basemap);

      // var ortofoto = new ol.layer.Tile({
      //   opacity: 1.0,
      //   source: new ol.source.WMTS({
      //     url: 'https://services.kortforsyningen.dk/orto_foraar?ticket=' + kfticket,
      //     format: 'image/jpeg',
      //     matrixSet: 'View1',
      //     layer: 'orto_foraar',
      //     style: 'default',
      //     tileGrid: new ol.tilegrid.WMTS({
      //       origin: ol.extent.getTopLeft(projectionExtent),
      //       resolutions: resolutions,
      //       matrixIds: matrixIds
      //     })
      //   })
      // });
      // layers.push(ortofoto);

      var matrikelkort = new ol.layer.Tile({
        opacity: 1.0,
        source: new ol.source.TileWMS({
          url: 'https://services.kortforsyningen.dk/service',
          params: {
            VERSION: '1.3.0',
            LAYERS: 'Centroide,MatrikelSkel,OptagetVej',
            FORMAT: 'image/png',
            STYLES: 'sorte_centroider,sorte_skel,default',
            TICKET: kfticket,
            SERVICE:'WMS',
            SERVICENAME: 'mat',
            TRANSPARENT: 'TRUE',
            REQUEST: 'GetMap',
            SRS: 'EPSG:25832'
          },
          tileGrid: new ol.tilegrid.WMTS({
            origin: ol.extent.getTopLeft(projectionExtent),
            resolutions: resolutions,
            matrixIds: matrixIds
          }),
          projection: projection
        })
      });
      layers.push(matrikelkort);

      // Create map with wms as background layer
      var map = new ol.Map({
        target: 'mapid',
        layers: layers,
        logo: false,
        controls: ol.control.defaults({}),
        view: new ol.View({
          center: [575130.409185,6224236.93897],
          zoom: 6,
          minZoom: 5,
          maxZoom: resolutions.length,
          projection: projection
        })
      });
    }

    var ticket_cookie = new Cookie('kfticket');
    var ticket = ticket_cookie.get();
    var expire = new Date();
    expire.setTime(expire.getTime() + (23*60*60*1000));

    if (ticket === undefined) {
      ticket = ticketService.getTicket();
      ticket_cookie.set(ticket, expire);
    }

    displayMaps(ticket);
  }
]);