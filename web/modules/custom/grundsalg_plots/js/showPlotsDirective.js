/**
 * @file
 * Contains the show plots component
 */

/**
 * Plots component directive.
 *
 * html parameters:
 */
angular.module('grundsalg').directive('plots', ['$window', 'plotsService',
  function($window, plotsService) {
    return {
      restrict: 'AE',
      replace: true,
      scope: {
        plots: '=',
        displayLimit: '='
      },
      link: function(scope) {

        /**
         * Click handler to update plots on the node edit form.
         */
        scope.fetchPlots = function fetchPlots() {
          // If field exists.
          var el = document.getElementsByName('field_subdivision_id[0][value]');
          if (el.length) {
            // Set subdivision id to field value.
            var subdivisionId = el[0].value;

            // Fetch plots based on url
            plotsService.getPlots(subdivisionId).then(function (plots) {
              scope.plots = plots['grunde'];
            }, function (err) {
              // @TODO: Display message to user.
              console.error(err);
            });
          }
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
      },
      templateUrl: drupalSettings.grundsalg_plots.template
    };
  }
]);

