/**
 * @file
 * Contains the Map Controller.
 */

angular.module('grundsalg').controller('MapController', ['$scope', '$window', '$http', '$timeout', '$templateCache', '$compile', '$q', 'ticketService', 'cookieService', 'drupalService', 'plotsService', 'mapsProxyService',
  function($scope, $window, $http, $timeout, $templateCache, $compile, $q, ticketService, cookieService, drupalService, plotsService, mapsProxyService) {
    'use strict';

    var config = drupalSettings.grundsalg_maps;

    // Send plot type into map template.
    $scope.type = config.map_type;

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
     * Get ticket needed to access KF tile server.
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

      // Init the map.
      return new ol.Map({
        target: 'mapid',
        logo: false,
        interactions: ol.interaction.defaults({ mouseWheelZoom: false }),
        controls: ol.control.defaults(),
        view: new ol.View({
          center: config.hasOwnProperty('center') ? config.center : [575130.409185, 6224236.93897],
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

        // As this layer may be delayed in being added to the map, do to the ticket
        // callback. We have to ensure that it's placed below the marker layers.
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

        // As this layer may be delayed in being added to the map, do to the ticket
        // callback. We have to ensure that it's placed below the marker layers.
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

        // As this layer may be delayed in being added to the map, do to the ticket
        // callback. We have to ensure that it's placed below the marker layers.
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

        // As this layer may be delayed in being added to the map, do to the ticket
        // callback. We have to ensure that it's placed below the marker layers.
        layer.setZIndex(-5);
        map.addLayer(layer);
      });
    }

    /**
     * Layer from Midttrafik.
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
          return config.url + '/api/midttrafik?SERVICE=WFS&VERSION=1.0.0&OUTPUTFORMAT=application/json&REQUEST=GetFeature&TYPENAME=Midttrafik:' + layerName + '&SRSNAME=EPSG:25832&&CQL_FILTER=komnr=751';
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
            src: config.popup.bus.marker,
            scale: config.popup.bus.scale
          })
        })
      });

      map.addLayer(dataLayer);
    }

    /**
     * Fade all municipalities except Aarhus.
     *
     * @param {ol.Map} map
     *   The OpenLayers map object.
     */
    function addMunicipalitiesFadeLayer(map) {
      drupalService.getMunicipalities().then(function success(data) {
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
              color: 'rgba(255, 255, 255, 0.55)'
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
        positioning: 'top-center'
      });
      map.addOverlay(popup);

      // Change mouse cursor when over a marker.
      var target =  document.getElementById(map.getTarget());
      map.on('pointermove', function(e) {
        var pixel = map.getEventPixel(e.originalEvent);
        var hit = map.hasFeatureAtPixel(pixel);
        if (hit) {
          // Check if this feature has an marker.
          map.forEachFeatureAtPixel(pixel, function(feature) {
            target.style.cursor = feature.get('markers') ? 'pointer' : '';
          });
        }
        else {
          target.style.cursor = '';
        }
      });

      // Display popup on click.
      map.on('click', function(evt) {
        map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
          // Get metadata for the clicked on features layer.
          var metadata = layer.get('metadata');

          if (feature && feature.get('markers')) {
            // Move popup to the right position.
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
               * Place number separators in a number.
               *
               * @param {int} x
               *   The input number.
               * @returns {string}
               *   The number as a string with separators in place.
               */
              scope.numberWithSeparator = function numberWithSeparator(x) {
                var parts = x.toString().split(".");
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                return parts.join(",");
              };

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
              // Timeout here is to allow the DOM a digest cycle. It will not
              // work without it.
              $timeout(function () {
                $compile($content)(scope);
                scope.show = true;

                // Add timeout function here to allow angular to render the
                // popup content or the calculated height will be wrong. This is
                // used to move the popup/map into view if this partly outside
                // the current view area.
                $timeout(function () {
                  // Get element
                  var bs_element = document.getElementsByClassName('popup')[0];
                  var clicked_pixel = evt.pixel;
                  var mapSize = map.getSize();

                  var offset_height = 10;
                  var offset_width = 10;

                  // Get popup height.
                  var popup_height = Math.max(
                    bs_element.scrollHeight,
                    bs_element.offsetHeight,
                    bs_element.clientHeight
                  ) + offset_height;

                  // Get popup width.
                  var popup_width = Math.max(
                      bs_element.scrollWidth,
                      bs_element.offsetWidth,
                      bs_element.clientWidth
                    ) + offset_width;

                  // Calculate if the popup is outside the view area.
                  var remaining_height = mapSize[1] - clicked_pixel[1] - popup_height;
                  var remaining_width = mapSize[0] - clicked_pixel[0] - popup_width;

                  // Get current view and map center.
                  var view = map.getView();
                  var center_px = map.getPixelFromCoordinate(view.getCenter());

                  // Check if we are outside map view.
                  if (remaining_height < 0 || remaining_width < 0) {
                    if (remaining_height < 0) {
                      center_px[1] -= remaining_height;
                    }
                    if (remaining_width < 0) {
                      center_px[0] -= remaining_width;
                    }

                    view.animate({
                      center: map.getCoordinateFromPixel(center_px),
                      duration: 300
                    });
                  }
                });
              });
            }, function (err) {
              console.error(err);
            });
          }
        });
      });
    }

    /**
     * Add area marks layer to the map.
     *
     * @param {ol.Map} map
     *   The OpenLayers map object.
     * @param {number} typeId
     *   The type of area to get (Villa, Parcelle, Erhvers) as their id.
     */
    function addAreasLayer(map, typeId) {
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
              src: config.popup.areas.marker,
              scale: config.popup.areas.scale
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
      }, function error(err) {
        console.error(err);
      });
    }

    /**
     * Add subdivision marks layer to the map.
     *
     * @param {ol.Map} map
     *   The OpenLayers map object.
     * @param {number} typeId
     *   The type of area to get (Villa, Parcelle, Erhvers) as their id.
     * @param {number} areaId
     *   The id of the area to use.
     */
    function addSubdivisionLayer(map, typeId, areaId) {
      drupalService.getSubdivisions(typeId, areaId).then(function success(data) {
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
              src: config.popup.subdivision.marker,
              scale: config.popup.subdivision.scale
            })
          })
        });

        // Store metadata on the layer. Used later on to create correct
        // templates.
        dataLayer.set('metadata', {
          'type' : 'subdivision'
        });

        // Add the layer to the map and zoom to it.
        map.addLayer(dataLayer);
        map.getView().fit(dataSource.getExtent(), map.getSize());
      }, function error(err) {
        console.error(err);
      });
    }

    /**
     * Add projects marks layer to the map.
     *
     * @param {ol.Map} map
     *   The OpenLayers map object.
     */
    function addProjectsLayer(map) {
      drupalService.getProjects().then(function success(data) {
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
              src: config.popup.projects.marker,
              scale: config.popup.projects.scale
            })
          })
        });

        // Store metadata on the layer. Used later on to create correct
        // templates.
        dataLayer.set('metadata', {
          'type' : 'projects'
        });

        // Add the layer to the map and zoom to it.
        map.addLayer(dataLayer);
      }, function error(err) {
        console.error(err);
      });
    }


    /**
     * Add layer with industry markers.
     *
     * @param {ol.Map} map
     *   The OpenLayers map object.
     * @param {ol.Collection } collection
     *   The group for this layer.
     * @param {number} industryId
     *   The industry's identification number.
     * @param {string} title
     *   The layers title.
     */
    function addIndustryLayer(map, collection, industryId, title) {
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
              src: markerUrl,
              scale: config.popup.industry.marker.scale
            })
          })
        });

        // Store metadata on the layer. Used later on to create correct
        // templates.
        dataLayer.set('metadata', {
          'type' : 'industry',
          'industryId': industryId
        });

        // Add the layer to the collection.
        collection.push(dataLayer);
      });
    }

    /**
     * Add layer with institution markers.
     *
     * @param {ol.Map} map
     *   The OpenLayers map object.
     * @param {ol.Collection } collection
     *   The group for this layer.
     * @param {number} type
     *   The institution type.
     * @param {string} title
     *   The layers title.
     */
    function addInstitutionLayer(map, collection, type, title) {
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
              src: markerUrl,
              scale: config.popup.institution.marker.scale
            })
          })
        });

        // Store metadata on the layer. Used later on to create correct
        // templates.
        dataLayer.set('metadata', {
          'type' : 'institution',
          'institutionType': type
        });

        // Add the layer to the collection.
        collection.push(dataLayer);
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
        // Only add the layer if it has features.
        if (data.features.length) {
          // @TODO: Should this be configurable under "site settings"?
          var statusStyles = {
            'Fremtidig': [64, 156, 218, 0.4],
            'Ledig': [78, 157, 45, 0.4],
            'Reserveret': [245, 196, 0, 0.4],
            'I udbud': [159, 182, 201, 0.4],
            'Solgt': [227, 6, 19, 0.4]
          };

          var defaultStyle = new ol.style.Style({
            fill: new ol.style.Fill({
              color: [227, 6, 19, 0,4]
            }),
            stroke: new ol.style.Stroke({
              color: [227, 6, 19],
              width: 4
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
                var strokeColor = angular.copy(statusStyles[status]);
                strokeColor[3] = 1;
                styleCache[status] = new ol.style.Style({
                  fill: new ol.style.Fill({
                    color: statusStyles[status]
                  }),
                  stroke: new ol.style.Stroke({
                    color: strokeColor,
                    width: 3
                  })
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
        }
      }, function error(err) {
        console.error(err);
      });
    }

    /**
     * Display information about the map.
     *
     * Used when debuging and changes in configuration.
     *
     * @param {ol.Map} map
     *   The OpenLayers map object.
     */
    function mapDebugInfo(map) {
      map.on('moveend', function(evt) {
        var ext = map.getView().calculateExtent(map.getSize());
        console.log('Extent: ' + ext[0] + ',' + ext[1] + ',' + ext[2] + ',' + ext[3]);
        console.log('Zoom: ' + map.getView().getZoom());
      });
    }

    var resolutions = [1638.4,819.2,409.6,204.8,102.4,51.2,25.6,12.8,6.4,3.2,1.6,.8,.4,.2];
    var matrixIds = ["L00","L01","L02","L03","L04","L05","L06","L07","L08","L09","L10","L11","L12","L13"];
    var map = initOpenlayersMap();

    /**
     * Calculates the extent that should be used to limit the map.
     *
     * It has a minimum extent size that should be used if the current we is smaller
     * than that.
     *
     * @param {ol.Map} map
     *   The OpenLayers map object.
     *
     * @return extent
     *   The extent that the map should be limited to.
     */
    function calculateExtent(map) {
      var currentExtent = view.calculateExtent(map.getSize());
      var minExtentLimit = [474778.409185, 6184044.93897, 675482.409185, 6264428.93897];

      if (!ol.extent.containsExtent(currentExtent, minExtentLimit)) {
        return minExtentLimit;
      }

      return currentExtent;
    }

    /**
     * Helper function to restrict pan in the maps.
     */
    var view = map.getView();
    var extent = config.extent === 'auto' ? calculateExtent(map) : config.extent;
    view.on('change:center', function () {
      var visible = view.calculateExtent(map.getSize());
      var centre = view.getCenter();

      var delta;
      var adjust = false;

      // Left/right
      if ((delta = extent[0] - visible[0]) > 0) {
        adjust = true;
        centre[0] += delta;
      }
      else if ((delta = extent[2] - visible[2]) < 0) {
        adjust = true;
        centre[0] += delta;
      }

      // Left/right
      if ((delta = extent[1] - visible[1]) > 0) {
        adjust = true;
        centre[1] += delta;
      }
      else if ((delta = extent[3] - visible[3]) < 0) {
        adjust = true;
        centre[1] += delta;
      }

      // If changes are needed to prevent pan outside extend.
      if (adjust) {
        view.setCenter(centre);
      }
    });

    switch (config.map_type) {
      case 'overview_page':
        addTopographicallyLayer(map, matrixIds, resolutions);
        addMunicipalitiesFadeLayer(map);

        // Add areas layer.
        addAreasLayer(map, config.plot_type);

        // Enable popups.
        addPopups(map);
        break;

      case 'area':
        addTopographicallyLayer(map, matrixIds, resolutions);
        addMunicipalitiesFadeLayer(map);

        var layerSwitcher = new ol.control.LayerSwitcher();
        map.addControl(layerSwitcher);

        // Create layer collection - Dagligvarer.
        var colStores = new ol.Collection();
        addIndustryLayer(map, colStores, 471110, 'Købmænd og døgnkiosker');
        addIndustryLayer(map, colStores, 471120, 'Supermarkeder');
        addIndustryLayer(map, colStores, 471130, 'Discountforretninger');

        // Create layer group based on store collection.
        var layerGroupStore = new ol.layer.Group({
          title: 'Dagligvarer',
          combine: true,
          visible: false
        });
        layerGroupStore.setLayers(colStores);
        map.addLayer(layerGroupStore);

        // Create layer collection - Skoler.
        var colSchools = new ol.Collection();
        addInstitutionLayer(map, colSchools, 'specskole', 'Specialskole');
        addInstitutionLayer(map, colSchools, 'skole', 'Skoler');
        addInstitutionLayer(map, colSchools, 'privskole', 'Private skole');

        // Create layer group based on store collection.
        var layerGroupSchools = new ol.layer.Group({
          title: 'Skoler',
          combine: true,
          visible: false
        });
        layerGroupSchools.setLayers(colSchools);
        map.addLayer(layerGroupSchools);

        // Create layer collection - Institutioner.
        var colInstitution = new ol.Collection();
        addInstitutionLayer(map, colInstitution, 'dagtilbud', 'Dagtilbud');
        addInstitutionLayer(map, colInstitution, 'dagpleje', 'Dagpleje');
        addInstitutionLayer(map, colInstitution, 'fritid', 'Fritid');
        addInstitutionLayer(map, colInstitution, 'intinst', 'Institutioner');
        addInstitutionLayer(map, colInstitution, 'vuggestue', 'Vuggestue');
        addInstitutionLayer(map, colInstitution, 'bornehave', 'Børnehave');
        addInstitutionLayer(map, colInstitution, 'fu', 'Fælles ungdomsklub');
        addInstitutionLayer(map, colInstitution, 'privtilbud', 'Privat tilbud');

        // Create layer group based on store collection.
        var layerGroupInstitution = new ol.layer.Group({
          title: 'Institutioner',
          combine: true,
          visible: false
        });
        layerGroupInstitution.setLayers(colInstitution);
        map.addLayer(layerGroupInstitution);

        addMidttrafikLayer(map, 'STOPS_28052014', 'Busstoppesteder');

        // Add areas layer.
        addSubdivisionLayer(map, config.plot_type, config.area_id);

        // Enable popups.
        addPopups(map);
        //addInstitutionLayer(map, 'tandplejen', 'Tandplejen');
        break;

      case 'subdivision':
        addOrtofotoLayer(map, matrixIds, resolutions);
        addMunicipalitiesFadeLayer(map);
        addMatrikelLayer(map, matrixIds, resolutions);
        addPlots(map);

        var layerSwitcher = new ol.control.LayerSwitcher();
        map.addControl(layerSwitcher);

        // Create layer collection - Dagligvarer.
        var colStores = new ol.Collection();
        addIndustryLayer(map, colStores, 471110, 'Købmænd og døgnkiosker');
        addIndustryLayer(map, colStores, 471120, 'Supermarkeder');
        addIndustryLayer(map, colStores, 471130, 'Discountforretninger');

        // Create layer group based on store collection.
        var layerGroupStore = new ol.layer.Group({
          title: 'Dagligvarer',
          combine: true,
          visible: false
        });
        layerGroupStore.setLayers(colStores);
        map.addLayer(layerGroupStore);

        // Create layer collection - Skoler.
        var colSchools = new ol.Collection();
        addInstitutionLayer(map, colSchools, 'specskole', 'Specialskole');
        addInstitutionLayer(map, colSchools, 'skole', 'Skoler');
        addInstitutionLayer(map, colSchools, 'privskole', 'Private skole');

        // Create layer group based on store collection.
        var layerGroupSchools = new ol.layer.Group({
          title: 'Skoler',
          combine: true,
          visible: false
        });
        layerGroupSchools.setLayers(colSchools);
        map.addLayer(layerGroupSchools);

        // Create layer collection - Institutioner.
        var colInstitution = new ol.Collection();
        addInstitutionLayer(map, colInstitution, 'dagtilbud', 'Dagtilbud');
        addInstitutionLayer(map, colInstitution, 'dagpleje', 'Dagpleje');
        addInstitutionLayer(map, colInstitution, 'fritid', 'Fritid');
        addInstitutionLayer(map, colInstitution, 'intinst', 'Institutioner');
        addInstitutionLayer(map, colInstitution, 'vuggestue', 'Vuggestue');
        addInstitutionLayer(map, colInstitution, 'bornehave', 'Børnehave');
        addInstitutionLayer(map, colInstitution, 'fu', 'Fælles ungdomsklub');
        addInstitutionLayer(map, colInstitution, 'privtilbud', 'Privat tilbud');

        // Create layer group based on store collection.
        var layerGroupInstitution = new ol.layer.Group({
          title: 'Institutioner',
          combine: true,
          visible: false
        });
        layerGroupInstitution.setLayers(colInstitution);
        map.addLayer(layerGroupInstitution);

        addMidttrafikLayer(map, 'STOPS_28052014', 'Busstoppesteder');

        addPopups(map);
        break;

      case 'project':
        addTopographicallyLayer(map, matrixIds, resolutions);
        addMunicipalitiesFadeLayer(map);

        addProjectsLayer(map);

        addPopups(map);
        break;
    }
  }
]);
