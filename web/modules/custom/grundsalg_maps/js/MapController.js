/**
 * @file
 * Contains the Map Controller.
 */

angular.module('grundsalg').controller('MapController', ['$scope', '$http', '$timeout', '$templateCache', '$compile', '$q', 'ticketService', 'cookieService',
  function($scope, $http, $timeout, $templateCache, $compile, $q, ticketService, cookieService) {
    'use strict';

    var config = drupalSettings.grundsalg_maps;

    /**
     * Load template file from URL.
     *
     * @param tmpl
     * @param config
     * @returns {*}
     */
    function loadTemplateUrl(tmpl, config) {
      return $http.get(tmpl, angular.extend({cache: false}, config || {})).then(function(res) {
        return res.data || '';
      });
    }

    /**
     * Load template from cache and fallback to URL.
     *
     * @param tmpl
     * @returns {*}
     */
    function loadTemplate(tmpl) {
      if (!tmpl) {
        return 'Empty template';
      }

      return $templateCache.get(tmpl) || loadTemplateUrl(tmpl, {cache: false});
    }

    /**
     * Get ticket need to access KF tile server.
     *
     * @return {promise}
     *   Resolves with the ticket or rejected with a error message.
     */
    function getTicket() {
      var deferred = $q.defer();

      var cookieName = 'kfticket';
      var ticket = cookieService.get(cookieName);

      if (ticket == undefined) {
        ticketService.getTicket().then(function success(ticket) {
          // Store the new ticket in a cookie for 23 hours.
          var expire = new Date();
          expire.setTime(expire.getTime() + (23*60*60*1000));
          cookieService.set(cookieName, ticket, expire);

          deferred.resolve(ticket);
        },
        function err(err) {
          deferred.reject(err);
        });
      }
      else {
        deferred.resolve(ticket);
      }

      return deferred.promise;
    }

    /**
     * Get the projection.
     *
     * @returns {ol.proj.Projection}
     *   The projection used by KF.
     */
    function getProjectionEPSG25832() {
      return ol.proj.get("EPSG:25832");
    }

    /**
     * Initialize the OpenLayers Map.
     *
     * @returns {ol.Map}
     *   The OpenLayers map object.
     */
    function initOpenlayersMap() {
      // Add new projection to OpenLayers to support KF.
      proj4.defs("EPSG:25832","+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs");
      var dkProjection = new ol.proj.Projection({
        code: 'EPSG:25832',
        extent: [120000, 5661139.2, 958860.8, 6500000],
        units: 'm'
      });
      ol.proj.addProjection(dkProjection);

      // Init the map
      return new ol.Map({
        target: 'mapid',
        logo: false,
        controls: ol.control.defaults(),
        view: new ol.View({
          center: [575130.409185, 6224236.93897],
          zoom: config.zoom.default,
          minZoom: config.zoom.min,
          maxZoom: config.zoom.max,
          projection: getProjectionEPSG25832()
        })
      });
    }

    /**
     * Add basic topographically base map.
     *
     * @param {ol.Map} map
     *   The OpenLayers map object.
     * @param {array} matrixIds
     *   Matrix IDs
     * @param {array} resolutions
     *   Maps resolutions.
     */
    function addTopographicallyLayer(map, matrixIds, resolutions) {
      getTicket().then(function (ticket) {
        map.addLayer(new ol.layer.Tile({
          opacity: 1.0,
          source: new ol.source.WMTS({
            url: 'https://services.kortforsyningen.dk/topo_skaermkort?ticket=' + ticket,
            format: 'image/jpeg',
            matrixSet: 'View1',
            layer: 'dtk_skaermkort',
            style: 'default',
            tileGrid: new ol.tilegrid.WMTS({
              origin: ol.extent.getTopLeft(getProjectionEPSG25832().getExtent()),
              resolutions: resolutions,
              matrixIds: matrixIds
            })
          })
        }));
      });
    }

    /**
     * Add "matrikel" map layer.
     *
     * @param {ol.Map} map
     *   The OpenLayers map object.
     * @param {array} matrixIds
     *   Matrix IDs
     * @param {array} resolutions
     *   Maps resolutions.
     */
    function addMatrikelLayer(map, matrixIds, resolutions) {
      getTicket().then(function (ticket) {
        var projection = getProjectionEPSG25832();

        map.addLayer(new ol.layer.Tile({
          opacity: 1.0,
          source: new ol.source.TileWMS({
            url: 'https://services.kortforsyningen.dk/service',
            params: {
              VERSION: '1.3.0',
              LAYERS: 'Centroide,MatrikelSkel,OptagetVej',
              FORMAT: 'image/png',
              STYLES: 'sorte_centroider,sorte_skel,default',
              TICKET: ticket,
              SERVICE:'WMS',
              SERVICENAME: 'mat',
              TRANSPARENT: 'TRUE',
              REQUEST: 'GetMap',
              SRS: 'EPSG:25832'
            },
            tileGrid: new ol.tilegrid.WMTS({
              origin: ol.extent.getTopLeft(projection.getExtent()),
              resolutions: resolutions,
              matrixIds: matrixIds
            }),
            projection: projection
          })
        }));
      });
    }

    /**
     * Add "orto foto" map layer.
     *
     * @param {ol.Map} map
     *   The OpenLayers map object.
     * @param {array} matrixIds
     *   Matrix IDs
     * @param {array} resolutions
     *   Maps resolutions.
     */
    function addOrtofotoLayer(map, matrixIds, resolutions) {
      getTicket().then(function (ticket) {
        map.addLayer(new ol.layer.Tile({
          opacity: 1.0,
          source: new ol.source.WMTS({
            url: 'https://services.kortforsyningen.dk/orto_foraar?ticket=' + ticket,
            format: 'image/jpeg',
            matrixSet: 'View1',
            layer: 'orto_foraar',
            style: 'default',
            tileGrid: new ol.tilegrid.WMTS({
              origin: ol.extent.getTopLeft(getProjectionEPSG25832().getExtent()),
              resolutions: resolutions,
              matrixIds: matrixIds
            })
          })
        }));
      });
    }

    var resolutions = [1638.4,819.2,409.6,204.8,102.4,51.2,25.6,12.8,6.4,3.2,1.6,.8,.4,.2];
    var matrixIds = ["L00","L01","L02","L03","L04","L05","L06","L07","L08","L09","L10","L11","L12","L13"];
    var map = initOpenlayersMap();

    /**
     * @TODO: Move popup code into wrapper and move maps config etc into
     *        functions.
     */
    if (config.map_type == 'overview_page') {
      addTopographicallyLayer(map, matrixIds, resolutions);

      $http({
        method: 'GET',
        url: '/api/maps/areas/' + config.plot_type
      }).then(function success(response) {
        var areas = response.data;

        var format = new ol.format.GeoJSON({
          defaultDataProjection: 'EPSG:4326'
        });
        var testSource = new ol.source.Vector({
          features: format.readFeatures(areas, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:25832'
          })
        });

        var testLayer = new ol.layer.Vector({
          source: testSource,
          style: new ol.style.Style({
            image: new ol.style.Icon({
              anchor: [0.5, 40],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              src: config.popup.marker
            })
          })
        });

        // Add the layer to the map
        map.addLayer(testLayer);
        map.getView().fit(testSource.getExtent(), map.getSize());
        map.getView().setZoom(config.zoom.default);

        var element = document.getElementById('popup');
        var popup = new ol.Overlay({
          element: element,
          positioning: 'bottom-center',
          stopEvent: false,
          offset: [0, 0]
        });
        map.addOverlay(popup);

        // display popup on click
        map.on('click', function(evt) {
          var feature = map.forEachFeatureAtPixel(evt.pixel,
            function(feature) {
              return feature;
            });

          if (feature) {
            var coordinates = feature.getGeometry().getCoordinates();
            popup.setPosition(coordinates);

            $q.when(loadTemplate(config.popup.template)).then(function (template) {
              $templateCache.put(config.popup.template, template);

              var $content = angular.element(element);

              // Create new scope for the popup content.
              var scope = $scope.$new(true);
              scope.content = {
                'title': feature.get('title'),
                'teaser': feature.get('teaser'),
                'url': feature.get('url')
              };
              scope.icon = config.popup.icon;

              scope.close = function close() {
                $content.html('');
              };

              // Attach the angular template to the dom and render the
              // content.
              $content.html(template);
              $timeout(function () {
                $compile($content)(scope);
              });
            });
          }
        });

      }, function error(response) {
        console.error('FFS');
      });
    }
    else {
      addTopographicallyLayer(map, matrixIds, resolutions);
      //addOrtofotoLayer(map, matrixIds, resolutions);
      addMatrikelLayer(map, matrixIds, resolutions);
    }
  }
]);