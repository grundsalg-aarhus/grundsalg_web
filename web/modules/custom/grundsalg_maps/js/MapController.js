/**
 * @file
 * Contains the Map Controller.
 */

angular.module('grundsalg').controller('MapController', ['$scope', 'ticketService', 'cookieService',
  function($scope, ticketService, cookieService) {
    'use strict';

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

    var cookieName = 'kfticket';
    var ticket = cookieService.get(cookieName);

    if (ticket == undefined) {
      ticketService.getTicket().then(function success(ticket) {
        // Store the new ticket in the cookie for 23 hours.
        var expire = new Date();
        expire.setTime(expire.getTime() + (23*60*60*1000));
        cookieService.set(cookieName, ticket, expire);

        // Display the map.
        displayMaps(ticket);
      },
      function err(err) {
        console.error(err);
      });
    }
    else {
      // Display the map.
      displayMaps(ticket);
    }
  }
]);