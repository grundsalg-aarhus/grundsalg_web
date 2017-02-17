/**
 * @file
 * Contains the Map Controller.
 */

angular.module('grundsalg').controller('MapController', ['$scope', '$window', '$http', '$timeout', '$templateCache', '$compile', '$q', 'ticketService', 'cookieService', 'drupalService', 'plotsService', 'mapsProxyService',
  function($scope, $window, $http, $timeout, $templateCache, $compile, $q, ticketService, cookieService, drupalService, plotsService, mapsProxyService) {
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
     * OpenStreetMap layer to use in test.
     *
     * @param {ol.Map} map
     *   The OpenLayers map object.
     */
    function addOSMMap(map) {
      map.addLayer(new ol.layer.Tile({
        source: new ol.source.OSM()
      }));
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
        var layer = new ol.layer.Tile({
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
        });

        // As this layer may bee delayed in added to the map do to the ticket
        // callback. We have to ensure that it's based below the marker layers.
        layer.setZIndex(-10);
        map.addLayer(layer);
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

        var layer = new ol.layer.Tile({
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
        });

        // As this layer may bee delayed in added to the map do to the ticket
        // callback. We have to ensure that it's based below the marker layers.
        layer.setZIndex(-5);
        map.addLayer(layer);
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
      getTicket().then(function (ticket) {
        var projection = getProjectionEPSG25832();

        var layer = new ol.layer.Tile({
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
        });

        // As this layer may bee delayed in added to the map do to the ticket
        // callback. We have to ensure that it's based below the marker layers.
        layer.setZIndex(-5);
        map.addLayer(layer);
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
        var layer = new ol.layer.Tile({
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
        });

        // As this layer may bee delayed in added to the map do to the ticket
        // callback. We have to ensure that it's based below the marker layers.
        layer.setZIndex(-5);
        map.addLayer(layer);
      });
    }

    /**
     * Layer from Midt trafik.
     *
     * @param {ol.Map} map
     *   The OpenLayers map object.
     * @param {string} layerName
     *   The name of the WFS layer to load.
     * @param {string} title
     *   Title to add to the layer.
     */
    function addMidttrafikLayer(map, layerName, title) {
      var format = new ol.format.GeoJSON({
        defaultDataProjection: 'EPSG:25832',
        featureProjection: 'EPSG:25832'
      });

      var dataSource = new ol.source.Vector({
        format:  format,
        url: function(extent) {
          return 'http://localhost:3010/api/midttrafik?SERVICE=WFS&VERSION=1.0.0&OUTPUTFORMAT=application/json&REQUEST=GetFeature&TYPENAME=Midttrafik:' + layerName + '&SRSNAME=EPSG:25832&&CQL_FILTER=komnr=751';
        }
      });

      var dataLayer = new ol.layer.Vector({
        source: dataSource,
        title: title,
        visible: false,
        style: new ol.style.Style({
          image: new ol.style.Icon({
            anchor: [0.5, 40],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: '/modules/custom/grundsalg_maps/images/Bus_stop_symbol.svg'
          })
        })
      });

      map.addLayer(dataLayer);
      console.log(map.getLayers());

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
     * Add feature event clicks with popup to features with "markers" = true.
     *
     * @param {ol.Map} map
     *   The OpenLayers map object.
     */
    function addPopups(map) {
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
        map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
          // Get metadata for the clicked on features layer.
          var metadata = layer.get('metadata');

          if (feature && feature.get('markers')) {
            // Move popup into the right position.
            var coordinates = evt.coordinate;
            popup.setPosition(coordinates);

            // Load the template and add content to it.
            var templateUrl = config.popup[metadata.type].template;
            $q.when(loadTemplate(templateUrl)).then(function (template) {
              $templateCache.put(templateUrl, template);

              var $content = angular.element(element);

              // Create new scope for the popup content.
              var scope = $scope.$new(true);
              scope.content = {};
              var properties = feature.getProperties();
              for (var i in properties) {
                scope.content[i] = properties[i];
              }

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
      });
    }

    /**
     * Add areas marks layer to the map.
     *
     * @param {ol.Map} map
     *   The OpenLayers map object.
     * @param {number} zoomLevel
     *   The zoom level to use.
     * @param {number} typeId
     *   The type of area to get (Villa, Parcelle, Erhvers) as their id.
     */
    function addAreasLayer(map, zoomLevel, typeId) {
      drupalService.getAreas(typeId).then(function success(data) {

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
              src: config.popup.areas.marker
            })
          })
        });

        // Store metadata on the layer. Used later on to create correct
        // templates.
        dataLayer.set('metadata', {
          'type' : 'areas'
        });

        // Add the layer to the map and zoom to it.
        map.addLayer(dataLayer);
        map.getView().fit(dataSource.getExtent(), map.getSize());
        map.getView().setZoom(zoomLevel);
      }, function error(err) {
        console.error(err);
      });
    }


    /**
     * Add layer with industry markers.
     *
     * @param {ol.Map} map
     *   The OpenLayers map object.
     * @param {number} industryId
     *   The industry's identification number.
     * @param {string} title
     *   The layers title.
     */
    function addIndustryLayer(map, industryId, title) {
      mapsProxyService.getIndustryAsGeoJson(industryId).then(function success(data) {
        var format = new ol.format.GeoJSON({
          defaultDataProjection: 'EPSG:4326'
        });

        var dataSource = new ol.source.Vector({
          features: format.readFeatures(data, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:25832'
          })
        });

        // Find the marker to use or fallback to default.
        var markerUrl = config.popup.industry.marker.hasOwnProperty(industryId) ? config.popup.industry.marker[industryId] : config.popup.industry.marker.default;

        var dataLayer = new ol.layer.Vector({
          source: dataSource,
          title: title,
          visible: false,
          style: new ol.style.Style({
            image: new ol.style.Icon({
              anchor: [0.5, 40],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              src: markerUrl
            })
          })
        });

        // Store metadata on the layer. Used later on to create correct
        // templates.
        dataLayer.set('metadata', {
          'type' : 'industry',
          'industryId': industryId
        });

        // Add the layer to the map
        map.addLayer(dataLayer);
      });
    }

    /**
     * Add layer with institution markers.
     *
     * @param {ol.Map} map
     *   The OpenLayers map object.
     * @param {number} type
     *   The institution type.
     * @param {string} title
     *   The layers title.
     */
    function addInstitutionLayer(map, type, title) {
      mapsProxyService.getInstitutionAsGeoJson(type).then(function success(data) {
        var format = new ol.format.GeoJSON({
          defaultDataProjection: 'EPSG:4326'
        });

        var dataSource = new ol.source.Vector({
          features: format.readFeatures(data, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:25832'
          })
        });

        // Find the marker to use or fallback to default.
        var markerUrl = config.popup.institution.marker.hasOwnProperty(type) ? config.popup.institution.marker[type] : config.popup.institution.marker.default;

        var dataLayer = new ol.layer.Vector({
          source: dataSource,
          title: title,
          visible: false,
          style: new ol.style.Style({
            image: new ol.style.Icon({
              anchor: [0.5, 40],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              src: markerUrl
            })
          })
        });

        // Store metadata on the layer. Used later on to create correct
        // templates.
        dataLayer.set('metadata', {
          'type' : 'institution',
          'institutionType': type
        });

        // Add the layer to the map
        map.addLayer(dataLayer);
      });
    }


    /**
     * Add plots to the map.
     *
     * @param {ol.Map} map
     *   The OpenLayers map object.
     */
    function addPlots(map) {
      plotsService.getPlotsAsGeoJson(config.subdivision_id).then(function success(data) {

        // @TODO: Should this be configurable under "site settings"?
        var statusStyles = {
          'Udbud': 'rgba(245, 196, 0, 0.8)',
          'Auktion slut': 'rgba(227, 6, 19, 0.8)',
          'Ledig': 'rgba(78, 157, 45, 0.8)'
        };

        var defaultStyle = new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(78, 157, 45, 0.8)'
          }),
          stroke: new ol.style.Stroke({
            color: '#000',
            width: 0.25
          })
        });
        var styleCache = {};

        var format = new ol.format.GeoJSON({
          defaultDataProjection: 'EPSG:25832'
        });

        var dataSource = new ol.source.Vector({
          features: format.readFeatures(data, {
            dataProjection: 'EPSG:25832',
            featureProjection: 'EPSG:25832'
          })
        });

        var dataLayer = new ol.layer.Vector({
          source: dataSource,
          style: function styleFunction(feature, resolution) {
            var status = feature.get('status');

            // If the status is unknown use default style.
            if (!status || !statusStyles[status]) {
              return [defaultStyle];
            }

            // Check if style have been created. If not create it else use the
            // existing style.
            if (!styleCache[status]) {
              styleCache[status] = new ol.style.Style({
                fill: new ol.style.Fill({
                  color: statusStyles[status]
                }),
                stroke: defaultStyle.stroke
              });
            }

            return [styleCache[status]];
          }
        });

        // Store metadata on the layer. Used later on to create correct
        // templates.
        dataLayer.set('metadata', {
          'type' : 'plots'
        });

        // Add the layer to the map.
        map.addLayer(dataLayer);
        map.getView().fit(dataSource.getExtent(), map.getSize());

      }, function error(err) {
        console.error(err);
      });
    }

    var resolutions = [1638.4,819.2,409.6,204.8,102.4,51.2,25.6,12.8,6.4,3.2,1.6,.8,.4,.2];
    var matrixIds = ["L00","L01","L02","L03","L04","L05","L06","L07","L08","L09","L10","L11","L12","L13"];
    var map = initOpenlayersMap();

    if (config.map_type == 'overview_page') {
      //addOSMMap(map);

      addTopographicallyLayer(map, matrixIds, resolutions);
      addMunicipalitiesFadeLayer(map);
      addAreasLayer(map, config.zoom.default, config.plot_type);

      addIndustryLayer(map, 471110, 'Købmænd og døgnkiosker');
      addIndustryLayer(map, 471120, 'Supermarkeder');
      addIndustryLayer(map, 471130, 'Discountforretninger');


      addInstitutionLayer(map, 'dagtilbud', 'Dagtilbud');
      addInstitutionLayer(map, 'dagpleje', 'Dagpleje');
      addInstitutionLayer(map, 'fritid', 'Fritid');
      addInstitutionLayer(map, 'intinst', 'Institutioner');
      addInstitutionLayer(map, 'vuggestue', 'Vuggestue');
      addInstitutionLayer(map, 'bornehave', 'Børnehave');
      addInstitutionLayer(map, 'specskole', 'Specialskole');
      addInstitutionLayer(map, 'skole', 'Skoler');
      addInstitutionLayer(map, 'sfo', 'SFO');
      addInstitutionLayer(map, 'fu', 'Fælles ungdomsklub');
      addInstitutionLayer(map, 'privtilbud', 'Privat tilbud');
      addInstitutionLayer(map, 'tandplejen', 'Tandplejen');
      addInstitutionLayer(map, 'privskole', 'Private skole');


      addMidttrafikLayer(map, 'STOPS_28052014', 'Busstoppesteder');

      var layerSwitcher = new ol.control.LayerSwitcher({
        tipLabel: 'Légende' // Optional label for button
      });
      map.addControl(layerSwitcher);

      addPopups(map);
    }
    else if (config.map_type == 'subdivision') {
      addOrtofotoLayer(map, matrixIds, resolutions);
      addMunicipalitiesFadeLayer(map);
      addMatrikelLayer(map, matrixIds, resolutions);
      addPlots(map);

      addPopups(map);
    }
    else {
      addTopographicallyLayer(map, matrixIds, resolutions);
      addMunicipalitiesFadeLayer(map);
      addMatrikelLayer(map, matrixIds, resolutions);

      //addDagiLayer(map, matrixIds, resolutions, 'kommune');
    }
  }
]);