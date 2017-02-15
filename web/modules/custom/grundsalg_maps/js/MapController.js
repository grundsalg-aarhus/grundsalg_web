/**
 * @file
 * Contains the Map Controller.
 */

angular.module('grundsalg').controller('MapController', ['$scope', '$window', '$http', '$timeout', '$templateCache', '$compile', '$q', 'ticketService', 'cookieService', 'drupalService', 'plotsService',
  function($scope, $window, $http, $timeout, $templateCache, $compile, $q, ticketService, cookieService, drupalService, plotsService) {
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
        interactions: ol.interaction.defaults({ mouseWheelZoom: false }),
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
              LAYERS: 'MatrikelSkel,OptagetVej',
              FORMAT: 'image/png',
              STYLES: 'hvide_skel,default',
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
     * Add layer form WMS Dagi service.
     *
     * @param {ol.Map} map
     *   The OpenLayers map object.
     * @param {array} matrixIds
     *   Matrix IDs
     * @param {array} resolutions
     *   Maps resolutions.
     * @param {string} layer
     *   The layer to fetch form the service.
     */
    function addDagiLayer(map, matrixIds, resolutions, layer) {
      console.log(layer);
      getTicket().then(function (ticket) {
        var projection = getProjectionEPSG25832();

        map.addLayer(new ol.layer.Tile({
          opacity: 1.0,
          source: new ol.source.TileWMS({
            url: 'https://services.kortforsyningen.dk/service',
            params: {
              VERSION: '1.3.0',
              LAYERS: layer,
              FORMAT: 'image/png',
              STYLES: 'default',
              TICKET: ticket,
              SERVICE:'WMS',
              SERVICENAME: 'dagi',
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
     * Fade all municipalities not Aarhus.
     *
     * @param {ol.Map} map
     *   The OpenLayers map object.
     */
    function addMunicipalitiesFadeLayer(map) {
      drupalService.getMunicipalities(config.plot_type).then(function success(data) {
        var format = new ol.format.GeoJSON({
          defaultDataProjection: 'EPSG:4326'
        });

        var dataSource = new ol.source.Vector({
          features: format.readFeatures(data, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:25832'
          })
        });

        var dataLayer = new ol.layer.Vector({
          source: dataSource,
          style: new ol.style.Style({
            fill: new ol.style.Fill({
              color: 'rgba(255,255,255,0.8)'
            }),
            stroke: new ol.style.Stroke({
              color: '#000',
              width: 0.25
            })
          })
        });

        // Add the layer to the map.
        map.addLayer(dataLayer);
      }, function error(err) {
        console.error(err);
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

    /**
     * Add feature event clicks with popup to features with "markers" = true.
     *
     * @TODO: Optimizations reuse the scope and template. No need to recompile a
     *        new scope every time.
     */
    function addPopups() {
      var element = document.getElementById('popup');
      var popup = new ol.Overlay({
        element: element,
        autoPan: true,
        autoPanAnimation: {
          duration: 250
        }
      });
      map.addOverlay(popup);

      // Display popup on click.
      map.on('click', function(evt) {
        var feature = map.forEachFeatureAtPixel(evt.pixel,
          function(feature) {
            return feature;
          }
        );

        if (feature && feature.get('markers')) {
          var coordinates = evt.coordinate;
          popup.setPosition(coordinates);

          $q.when(loadTemplate(config.popup.template)).then(function (template) {
            $templateCache.put(config.popup.template, template);

            var $content = angular.element(element);

            // Create new scope for the popup content.
            var scope = $scope.$new(true);
            scope.content = {};
            var properties = feature.getProperties();
            for (var i in properties) {
              scope.content[i] = properties[i];
            }

            scope.icon = config.popup.icon;

            /**
             * Close the popup.
             */
            scope.close = function close() {
              $content.html('');
              scope.show = false;
            };

            /**
             * Expose the Drupal.t() function to angular templates.
             *
             * @param str
             *   The string to translate.
             * @returns string
             *   The translated string.
             */
            scope.Drupal = {
              "t": function (str) {
                return $window.Drupal.t(str);
              }
            };

            // Attach the angular template to the dom and render the
            // content.
            $content.html(template);
            $timeout(function () {
              $compile($content)(scope);

              scope.show = true;
            });
          }, function (err) {
            console.error(err);
          });
        }
      });
    }

    /**
     * Add marks layer to the map.
     *
     * @param {json} data
     *   The data (marks) to add to the layer.
     * @param {number} zoomLevel
     *   The zoom level to use.
     */
    function addMarkerLayer(data, zoomLevel) {
      var format = new ol.format.GeoJSON({
        defaultDataProjection: 'EPSG:4326'
      });

      var dataSource = new ol.source.Vector({
        features: format.readFeatures(data, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:25832'
        })
      });

      var dataLayer = new ol.layer.Vector({
        source: dataSource,
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
      map.addLayer(dataLayer);
      map.getView().fit(dataSource.getExtent(), map.getSize());
      map.getView().setZoom(zoomLevel);

      // Add popups to the markers.
      addPopups();
    }

    /**
     * Add plots to the map.
     *
     * @param {ol.Map} map
     *   The OpenLayers map object.
     */
    function addPlots(map) {
      plotsService.getPlotsAsGeoJson(config.subdivision_id).then(function success(data) {
        var format = new ol.format.GeoJSON({
          defaultDataProjection: 'EPSG:25832'
        });

        console.log(data);

        var dataSource = new ol.source.Vector({
          features: format.readFeatures(data, {
            dataProjection: 'EPSG:25832',
            featureProjection: 'EPSG:25832'
          })
        });

        var dataLayer = new ol.layer.Vector({
          source: dataSource,
          style: new ol.style.Style({
            fill: new ol.style.Fill({
              color: 'rgba(155,255,155,0.9)'
            }),
            stroke: new ol.style.Stroke({
              color: '#000',
              width: 0.25
            })
          })
        });

        // Add the layer to the map.
        map.addLayer(dataLayer);
        map.getView().fit(dataSource.getExtent(), map.getSize());

        // Add popups to the areas.
        addPopups();

      }, function error(err) {
        console.error(err);
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
      addMunicipalitiesFadeLayer(map);

      drupalService.getAreas(config.plot_type).then(function success(areas) {
        addMarkerLayer(areas, config.zoom.default, config.map_type);
      }, function error(err) {
        console.error(err);
      });
    }
    else if (config.map_type == 'subdivision') {
      addOrtofotoLayer(map, matrixIds, resolutions);
      addMunicipalitiesFadeLayer(map);
      addMatrikelLayer(map, matrixIds, resolutions);
      addPlots(map);
    }
    else {
      addTopographicallyLayer(map, matrixIds, resolutions);
      //addOrtofotoLayer(map, matrixIds, resolutions);
      addMunicipalitiesFadeLayer(map);
      addMatrikelLayer(map, matrixIds, resolutions);
      //addDagiLayer(map, matrixIds, resolutions, 'kommune');
    }
  }
]);