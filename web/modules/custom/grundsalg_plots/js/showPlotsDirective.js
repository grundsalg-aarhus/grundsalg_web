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

