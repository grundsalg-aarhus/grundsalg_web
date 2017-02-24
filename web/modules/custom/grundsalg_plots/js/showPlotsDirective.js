/**
 * @file
 * Contains the show plots component
 */

/**
 * Plots component directive.
 */
angular.module('grundsalg').directive('plots', ['$window',
  function($window) {
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

